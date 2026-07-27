const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectionDB = require("./config/database");
require("dotenv").config();

// ── Redis ─────────────────────────────────────────────────────────────────────
require("./config/redis")(); // Initialise Redis connection on startup
const {
  addOnlineUser,
  removeOnlineSocket,
  getOnlineSocketCount,
  getOnlineUserIds,
  isUserOnline,
  setActiveCall,
  getActiveCall,
  deleteActiveCall,
  getActiveCallsForUser,
} = require("./utils/redis");

// ── GraphQL (Apollo Server 4) ─────────────────────────────────────────────────
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const graphqlContext = require("./graphql/context");

const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    // Firebase Hosting URLs (default + alternate)
    "https://newflixgpt.web.app",
    "https://newflixgpt.firebaseapp.com",
    // Custom domain
    "https://lovenest.in",
    "https://www.lovenest.in",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
// Razorpay webhook needs the raw Buffer for HMAC signature verification.
// Register express.raw() for /payment/webhook BEFORE the global express.json().
app.use('/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const io = new Server(server, {
  cors: { ...corsOptions, methods: ["GET", "POST"] },
  transports: ["polling", "websocket"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ── Socket.io real-time layer ─────────────────────────────────────────────────
const jwt = require("jsonwebtoken");
const ConnectionRequest = require("./models/connectionRequest");
const Message = require("./models/message");
const User = require("./models/user");
const { syncPresence } = require("./utils/firebase-admin");
const { createNotification } = require("./routes/notificationRouter");

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.cookie
        ?.split(";")
        .find((c) => c.trim().startsWith("token="))
        ?.split("=")[1];
    if (!token) return next(new Error("Unauthorized"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded._id;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

// ── Online presence (Redis-backed) ───────────────────────────────────────────
// Legacy in-memory fallback for socket.id → userId reverse lookup (local only)
const socketUserMap = new Map(); // socketId => userId

async function getSocketIdsForUser(userId) {
  // We use Redis Sets `online:<userId>` → Set<socketId>
  // For local routing within this server instance, Socket.io handles rooms
  const count = await getOnlineSocketCount(userId?.toString());
  return count > 0 ? [userId?.toString()] : []; // used only for online check
}

io.on("connection", async (socket) => {
  const uid = socket.userId.toString();
  socket.join(uid);
  socket.join("user:" + uid);

  // Track reverse map for disconnect handling
  socketUserMap.set(socket.id, uid);

  // Online presence — Redis Set
  await addOnlineUser(uid, socket.id);
  socket.broadcast.emit("user_online", { userId: uid });
  socket.broadcast.emit("user_status_change", { userId: uid, status: "online" });
  const onlineUserIds = await getOnlineUserIds();
  socket.emit("online_users_snapshot", { onlineUserIds });
  try { await User.findByIdAndUpdate(uid, { isOnline: true }); } catch {}
  syncPresence(uid, true);

  // Join / leave named chat rooms
  socket.on("join_chat", (chatId) => {
    if (chatId && !socket.rooms.has(chatId)) socket.join(chatId);
  });
  socket.on("leave_chat", (chatId) => {
    if (chatId) socket.leave(chatId);
  });

  // Online check
  socket.on("check_online", async ({ userId }) => {
    const id = userId?.toString();
    const online = await isUserOnline(id);
    socket.emit("online_status", { userId: id, online });
  });
  socket.on("get_online_users", async () => {
    const onlineUserIds = await getOnlineUserIds();
    socket.emit("online_users_snapshot", { onlineUserIds });
  });

  // Typing indicators
  socket.on("typing_start", ({ receiverId }) => {
    if (receiverId) socket.to(receiverId.toString()).emit("user_typing", { userId: uid });
  });
  socket.on("typing_stop", ({ receiverId }) => {
    if (receiverId) socket.to(receiverId.toString()).emit("user_stopped_typing", { userId: uid });
  });
  socket.on("typing", ({ chatId }) => {
    if (chatId) socket.to(chatId).emit("user_typing", { chatId, userId: uid });
  });
  socket.on("stop_typing", ({ chatId }) => {
    if (chatId) socket.to(chatId).emit("user_stop_typing", { chatId, userId: uid });
  });

  // Read receipts
  socket.on("mark_read", async ({ senderId }) => {
    try {
      if (!senderId) return;
      await Message.updateMany(
        { senderId, receiverId: socket.userId, readAt: null },
        { readAt: new Date() }
      );
      socket.to(senderId.toString()).emit("messages_read", { by: uid });
    } catch (err) {
      console.error("mark_read error:", err.message);
    }
  });

  // Send message (supports all types)
  socket.on("send_message", async ({ receiverId, text, type = "text", mediaUrl, audioUrl, audioDuration, fileUrl, fileName, fileSize, stickerId, replyTo }) => {
    try {
      if (!receiverId) return;
      if (type === "text" && !text?.trim()) return;

      const connected = await ConnectionRequest.findOne({
        status: "accepted",
        $or: [
          { fromUserId: socket.userId, toUserId: receiverId },
          { fromUserId: receiverId, toUserId: socket.userId },
        ],
      });
      if (!connected) return;

      const msgData = { senderId: socket.userId, receiverId, type };
      if (type === "text") msgData.text = text.trim();
      if (mediaUrl) msgData.mediaUrl = mediaUrl;
      if (audioUrl) { msgData.audioUrl = audioUrl; msgData.audioDuration = audioDuration; }
      if (fileUrl) { msgData.fileUrl = fileUrl; msgData.fileName = fileName; msgData.fileSize = fileSize; }
      if (stickerId) msgData.stickerId = stickerId;
      if (replyTo) msgData.replyTo = replyTo;

      const msg = await Message.create(msgData);
      socket.to(receiverId.toString()).emit("receive_message", msg);
      socket.emit("message_sent", msg);

      const recipientOnline = await isUserOnline(receiverId.toString());
      if (!recipientOnline) {
        await createNotification({
          userId: receiverId,
          type: "message",
          data: { senderId: uid, preview: type === "text" ? text?.slice(0, 80) : "[" + type + "]" },
        });
      }
    } catch (err) {
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Message updates (reactions, edit, delete)
  socket.on("message_reaction", ({ msgId, receiverId, emoji }) => {
    if (receiverId) socket.to(receiverId.toString()).emit("message_reaction", { msgId, userId: uid, emoji });
  });
  socket.on("message_edited", ({ msgId, receiverId, text }) => {
    if (receiverId) socket.to(receiverId.toString()).emit("message_edited", { msgId, text });
  });
  socket.on("message_deleted", ({ msgId, receiverId, forAll }) => {
    if (receiverId) socket.to(receiverId.toString()).emit("message_deleted", { msgId, forAll });
  });

  // LiveKit call signaling
  socket.on("call_user", async ({ recipientId, callId, callType, callerName, callerAvatar, roomName }) => {
    try {
      if (!recipientId || !callId) return;
      const connected = await ConnectionRequest.findOne({
        status: "accepted",
        $or: [
          { fromUserId: socket.userId, toUserId: recipientId },
          { fromUserId: recipientId, toUserId: socket.userId },
        ],
      });
      if (!connected) return;
      const recipientOnline = await isUserOnline(recipientId.toString());
      if (!recipientOnline) {
        socket.emit("call_user_offline", { callId, recipientId });
        await createNotification({
          userId: recipientId,
          type: "call_missed",
          data: { callerId: uid, callerName, callType },
        });
        return;
      }
      await setActiveCall(callId, uid, recipientId.toString());
      io.to("user:" + recipientId.toString()).emit("incoming_call", {
        callId, callType, callerName, callerAvatar, callerId: uid, roomName,
      });
    } catch (err) {
      console.error("call_user error:", err.message);
    }
  });

  socket.on("call_accepted", ({ callId, callerId, roomName }) => {
    if (callerId) {
      io.to("user:" + callerId.toString()).emit("call_accepted", { callId, roomName, acceptedBy: uid });
    }
  });
  socket.on("call_rejected", async ({ callId, callerId }) => {
    if (callerId) io.to("user:" + callerId.toString()).emit("call_rejected", { callId, by: uid });
    await deleteActiveCall(callId);
  });
  socket.on("call_ended", async ({ callId, peerId }) => {
    if (peerId) io.to("user:" + peerId.toString()).emit("call_ended", { callId, by: uid });
    await deleteActiveCall(callId);
  });
  socket.on("call_missed", async ({ callId, receiverId: rid }) => {
    if (rid) io.to("user:" + rid.toString()).emit("call_missed", { callId, by: uid });
    await deleteActiveCall(callId);
  });

  // Disconnect
  socket.on("disconnect", async () => {
    socketUserMap.delete(socket.id);
    const remaining = await removeOnlineSocket(uid, socket.id);
    if (remaining === 0) {
      socket.broadcast.emit("user_offline", { userId: uid });
      socket.broadcast.emit("user_status_change", { userId: uid, status: "offline" });
      try { await User.findByIdAndUpdate(uid, { isOnline: false, lastSeen: new Date() }); } catch {}
      syncPresence(uid, false);
    }
    // End any active calls for this user
    const userCalls = await getActiveCallsForUser(uid);
    for (const call of userCalls) {
      const peerId = call.callerId === uid ? call.receiverId : call.callerId;
      io.to("user:" + peerId).emit("call_ended", { callId: call.callId, by: uid, reason: "disconnected" });
      await deleteActiveCall(call.callId);
    }
  });
});

const { ApolloServerPluginLandingPageLocalDefault } = require("@apollo/server/plugin/landingPage/default");

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ embed: true })
  ],
  formatError: (formattedError) => {
    // Don't expose internal server error details to clients in production
    if (
      process.env.NODE_ENV === "production" &&
      formattedError.extensions?.code === "INTERNAL_SERVER_ERROR"
    ) {
      return { message: "Internal server error", extensions: { code: "INTERNAL_SERVER_ERROR" } };
    }
    return formattedError;
  },
});

// Route registrations
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
const userRouter = require("./routes/userRouter");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chatRouter");
const uploadRouter = require("./routes/uploadRouter");
const callRouter = require("./routes/callRouter");
const chatbotRouter = require("./routes/chatbotRouter");
const passwordRouter = require("./routes/passwordRouter");
const notificationRouter = require("./routes/notificationRouter");
const adminRouter = require("./routes/adminRouter");
const stickerRouter = require("./routes/stickerRouter");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);
app.use("/", uploadRouter);
app.use("/", callRouter);
app.use("/", chatbotRouter);
app.use("/", passwordRouter);
app.use("/", notificationRouter);
app.use("/", adminRouter);
app.use("/", stickerRouter);

// ─────────────────────────────────────────────
//  Startup
// ─────────────────────────────────────────────
const BOLD  = "\x1b[1m";
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const CYAN  = "\x1b[36m";
const RED   = "\x1b[31m";
const DIM   = "\x1b[2m";

// Start Apollo then connect to DB and bind the HTTP server
apolloServer.start().then(() => {
  // Mount GraphQL middleware AFTER cookieParser so context() can read cookies
  app.use(
    "/graphql",
    cors(corsOptions),
    express.json(),
    (req, res, next) => {
      if (!req.body) req.body = {};
      next();
    },
    expressMiddleware(apolloServer, { context: graphqlContext })
  );

  return connectionDB();
}).then(() => {
    const PORT = process.env.PORT || 3000;

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\n  ${RED}✖  Port ${PORT} is already in use.${RESET} Stop the existing process and retry.\n`);
      } else {
        console.error(`\n  ${RED}✖  Server error:${RESET} ${err.message}\n`);
      }
      process.exit(1);
    });

    server.listen(PORT, () => {
      const MAGENTA = "\x1b[35m";
      const YELLOW  = "\x1b[33m";
      console.log(`\n${CYAN}${BOLD}  ╔${"-".repeat(46)}╗${RESET}`);
      console.log(`${CYAN}${BOLD}  |  💞  LoveNest  —  REST + GraphQL + Socket  |${RESET}`);
      console.log(`${CYAN}${BOLD}  ╚${"-".repeat(46)}╝${RESET}`);
      console.log();
      console.log(`  ${GREEN}${BOLD}🗄  Database   ${RESET}${DIM}MongoDB connected successfully${RESET}`);
      console.log(`  ${GREEN}${BOLD}🌐  Server     ${RESET}${CYAN}http://localhost:${PORT}${RESET}`);
      console.log(`  ${GREEN}${BOLD}🔷  GraphQL    ${RESET}${CYAN}http://localhost:${PORT}/graphql${RESET}`);
      console.log(`  ${GREEN}${BOLD}⚡  Socket.io  ${RESET}${DIM}Real-time events active${RESET}`);
      const rawRedisUrl = process.env.REDIS_URL || "redis://localhost:6379";
      const maskedRedisUrl = rawRedisUrl.replace(/:[^:@]+@/, ":****@");
      console.log(`  ${GREEN}${BOLD}🔴  Redis      ${RESET}${DIM}${maskedRedisUrl}${RESET}`);
      console.log(`  ${GREEN}${BOLD}☁️  Cloudinary ${RESET}${DIM}Media uploads ready${RESET}`);
      console.log(`  ${GREEN}${BOLD}📹  LiveKit    ${RESET}${DIM}Voice / video calls ready${RESET}`);
      console.log(`  ${GREEN}${BOLD}🤖  Groq AI    ${RESET}${DIM}Chatbot assistant active${RESET}`);
      console.log(`  ${GREEN}${BOLD}💳  Razorpay   ${RESET}${DIM}Payments configured${RESET}`);
      const { getAdminApp } = require("./utils/firebase-admin");
      const firebaseStatus = getAdminApp() ? `${DIM}Admin SDK ready${RESET}` : `\x1b[33m${DIM}Skipped (no credentials)${RESET}`;
      console.log(`  ${GREEN}${BOLD}🔥  Firebase   ${RESET}${firebaseStatus}`);
      console.log();
      console.log(`  ${YELLOW}●  Env     ${RESET}${DIM}${process.env.NODE_ENV || "development"}${RESET}`);
      console.log(`  ${YELLOW}●  PID     ${RESET}${DIM}${process.pid}${RESET}`);
      console.log(`  ${YELLOW}●  Node    ${RESET}${DIM}${process.version}${RESET}`);
      console.log(`  ${YELLOW}●  Time    ${RESET}${DIM}${new Date().toLocaleString()}${RESET}`);
      console.log();
      console.log(`  ${CYAN}${DIM}${"─".repeat(46)}${RESET}\n`);
    });
  })
  .catch((err) => {
    console.error(`\n  ${RED}✖  Database connection failed:${RESET} ${err.message}\n`);
    process.exit(1);
  });

process.on("uncaughtException", (err) => {
  console.error(`\n  ${RED}✖  Uncaught Exception:${RESET} ${err.message}\n`, err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error(`\n  ${RED}✖  Unhandled Rejection:${RESET}`, reason);
});