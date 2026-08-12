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

// ── ML Client ───────────────────────────────────────────────────────────────────────────────────────
const { callML } = require("./utils/mlClient");

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

      // ── ML: Feature 2 — Toxicity check for text messages ─────────────────────────────
      if (type === "text" && text?.trim()) {
        const modResult = await callML("/ml/moderate-text", {
          text: text.trim(),
          userId: uid,
          receiverId: receiverId?.toString(),
        }, 2500);
        if (modResult?.is_toxic) {
          socket.emit("message_blocked", {
            reason: "Community guidelines violation",
            label: modResult.max_label,
          });
          // Log blocked message asynchronously
          try {
            const ModerationLog = require("./models/moderationLog");
            await ModerationLog.create({
              userId: socket.userId,
              targetUserId: receiverId,
              text: text.trim(),
              scores: modResult.scores,
              maxLabel: modResult.max_label,
              maxScore: modResult.max_score,
              action: "blocked",
            });
          } catch {}
          return; // Skip saving the message
        }
      }

      // ── ML: Feature 9 — Voice emotion detection (non-blocking) ───────────────────────────
      if (type === "voice" && audioUrl) {
        const emotionResult = await callML("/ml/voice-emotion", { audio_url: audioUrl }, 8000);
        if (emotionResult?.emotion && !emotionResult.error) {
          msgData.voiceEmotion = emotionResult.emotion;
        }
      }

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
const mlRouter = require("./routes/mlRouter");
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
app.use("/", mlRouter);

// ── Kubernetes Health Probe ───────────────────────────────────────────────────
// Required by k8s liveness & readiness probes (k8s/backend/deployment.yaml)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "LoveNest Backend",
    version: "1.0.0",
    uptime: Math.floor(process.uptime()),
  });
});

// ─────────────────────────────────────────────
//  Startup
// ─────────────────────────────────────────────
// ── ANSI colour palette ──────────────────────────────────────────────────────
const R   = "\x1b[0m";          // reset
const B   = "\x1b[1m";          // bold
const DIM = "\x1b[2m";
const IT  = "\x1b[3m";          // italic
const UL  = "\x1b[4m";

// Foreground
const RED    = "\x1b[31m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE   = "\x1b[34m";
const MAGEN  = "\x1b[35m";
const CYAN   = "\x1b[36m";
const WHITE  = "\x1b[97m";
const PINK   = "\x1b[38;5;213m";  // bright pink
const ROSE   = "\x1b[38;5;204m";  // hot rose
const LAVEN  = "\x1b[38;5;183m";  // lavender
const GOLD   = "\x1b[38;5;220m";  // gold
const TEAL   = "\x1b[38;5;87m";   // neon teal
const LIME   = "\x1b[38;5;119m";  // lime
const ORANGE = "\x1b[38;5;214m";  // orange
const GRAPE  = "\x1b[38;5;141m";  // grape

// Background
const BG_PINK  = "\x1b[48;5;213m";
const BG_ROSE  = "\x1b[48;5;204m";
const BG_BLACK = "\x1b[40m";

// ── Helpers ───────────────────────────────────────────────────────────────────
function badge(color, label) {
  return `${B}${color} ${label} ${R}`;
}
function ok(label)   { return badge("\x1b[42m\x1b[30m", ` ${label} `); }
function row(icon, label, value, valueColor = TEAL) {
  const pad = " ".repeat(Math.max(0, 14 - label.length));
  return `  ${icon}  ${B}${WHITE}${label}${R}${pad}${valueColor}${value}${R}`;
}
function sep(char = "─", len = 58, color = GRAPE) {
  return `  ${color}${char.repeat(len)}${R}`;
}

// ── Greeting based on hour ────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 6)  return "🌙  Burning the midnight oil, Sayak...";
  if (h < 12) return "🌅  Good morning, Sayak!";
  if (h < 17) return "☀️   Good afternoon, Sayak!";
  if (h < 21) return "🌆  Good evening, Sayak!";
  return "🌃  Late-night grind mode, Sayak!";
}

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
        console.error(`\n  ${RED}${B}✖  Port ${PORT} is already in use.${R}  Stop the existing process and retry.\n`);
      } else {
        console.error(`\n  ${RED}${B}✖  Server error:${R} ${err.message}\n`);
      }
      process.exit(1);
    });

    server.listen(PORT, () => {
      const { getAdminApp } = require("./utils/firebase-admin");
      const rawRedisUrl   = process.env.REDIS_URL || "redis://localhost:6379";
      const maskedRedis   = rawRedisUrl.replace(/:[^:@]+@/, ":****@");
      const firebaseReady = !!getAdminApp();
      const now           = new Date();
      const timeStr       = now.toLocaleString("en-IN", { hour12: true,
        weekday:"short", year:"numeric", month:"short", day:"numeric",
        hour:"2-digit", minute:"2-digit", second:"2-digit" });

      // ── 3-D ASCII LOGO ───────────────────────────────────────────────────────
      console.log();
      console.log(`  ${PINK}${B}╔══════════════════════════════════════════════════════════╗${R}`);
      console.log(`  ${PINK}${B}║${R}  ${ROSE}${B}██╗      ██████╗ ██╗   ██╗███████╗${R}                    ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}║${R}  ${ROSE}${B}██║     ██╔═══██╗██║   ██║██╔════╝${R}                    ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}║${R}  ${PINK}${B}██║     ██║   ██║██║   ██║█████╗  ${R}                    ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}║${R}  ${LAVEN}${B}██║     ██║   ██║╚██╗ ██╔╝██╔══╝  ${R}                    ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}║${R}  ${GRAPE}${B}███████╗╚██████╔╝ ╚████╔╝ ███████╗${R}                    ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}║${R}  ${GRAPE}${B}╚══════╝ ╚═════╝   ╚═══╝  ╚══════╝${R}                    ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}║${R}                                                          ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}║${R}  ${TEAL}${B}███╗   ██╗███████╗███████╗████████╗${R}                    ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}║${R}  ${TEAL}${B}████╗  ██║██╔════╝██╔════╝╚══██╔══╝${R}                    ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}║${R}  ${CYAN}${B}██╔██╗ ██║█████╗  ███████╗   ██║   ${R}                    ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}║${R}  ${LAVEN}${B}██║╚██╗██║██╔══╝  ╚════██║   ██║   ${R}                    ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}║${R}  ${GRAPE}${B}██║ ╚████║███████╗███████║   ██║   ${R}                    ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}║${R}  ${GRAPE}${B}╚═╝  ╚═══╝╚══════╝╚══════╝   ╚═╝   ${R}                   ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}║${R}                                                          ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}║${R}        ${GOLD}${B}✦  REST  ·  GraphQL  ·  Socket.io  ✦${R}          ${PINK}${B}║${R}`);
      console.log(`  ${PINK}${B}╚══════════════════════════════════════════════════════════╝${R}`);
      console.log();

      // ── Greeting ─────────────────────────────────────────────────────────────
      console.log(`  ${GOLD}${B}${IT}  ${greeting()}${R}`);
      console.log();

      // ── Separator ────────────────────────────────────────────────────────────
      console.log(sep("▰", 58, ROSE));
      console.log();

      // ── Service Status Rows ──────────────────────────────────────────────────
      console.log(row("🌐", "Server",    `http://localhost:${PORT}`,          TEAL));
      console.log(row("🔷", "GraphQL",   `http://localhost:${PORT}/graphql`,  CYAN));
      console.log(row("⚡", "Socket.io", "Real-time events active",           LIME));
      console.log(row("🗄 ", "MongoDB",   "Connected & ready",                 LIME));
      console.log(row("🔴", "Redis",     maskedRedis,                         ORANGE));
      console.log(row("☁️ ", "Cloudinary","Media uploads ready",              LAVEN));
      console.log(row("📹", "LiveKit",   "Voice / video calls ready",         LAVEN));
      console.log(row("🤖", "Groq AI",   "Chatbot assistant active",          PINK));
      console.log(row("💳", "Razorpay",  "Payments configured",              GOLD));
      console.log(row("🔥", "Firebase",  firebaseReady ? "Admin SDK ready" : "Skipped (no credentials)", firebaseReady ? LIME : YELLOW));
      console.log();

      // ── Separator ────────────────────────────────────────────────────────────
      console.log(sep("▰", 58, GRAPE));
      console.log();

      // ── Meta Rows ────────────────────────────────────────────────────────────
      console.log(`  ${GOLD}${B}◆${R}  ${WHITE}${B}Environment${R}   ${DIM}${process.env.NODE_ENV || "development"}${R}`);
      console.log(`  ${GOLD}${B}◆${R}  ${WHITE}${B}Node.js    ${R}   ${DIM}${process.version}${R}`);
      console.log(`  ${GOLD}${B}◆${R}  ${WHITE}${B}PID        ${R}   ${DIM}${process.pid}${R}`);
      console.log(`  ${GOLD}${B}◆${R}  ${WHITE}${B}Started    ${R}   ${DIM}${timeStr}${R}`);
      console.log();

      // ── Bottom glow bar ───────────────────────────────────────────────────────
      console.log(`  ${ROSE}${B}${'❤'.repeat(3)}${R}  ${PINK}${DIM}Built with love · LoveNest v1.0${R}  ${ROSE}${B}${'❤'.repeat(3)}${R}`);
      console.log();
      console.log(sep("═", 58, PINK));
      console.log();
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