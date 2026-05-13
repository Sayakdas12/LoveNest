const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectionDB = require("./config/database");
require("dotenv").config();

const cookieParser = require("cookie-parser");
const app = express();
const server = http.createServer(app);
const cors = require("cors");

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", require("express").static(require("path").join(__dirname, "../uploads")));

const io = new Server(server, {
  cors: corsOptions,
});

// Socket.io — real-time chat
const jwt = require("jsonwebtoken");
const ConnectionRequest = require("./models/connectionRequest");
const Message = require("./models/message");
const User = require("./models/user");

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie
      ?.split(";")
      .find(c => c.trim().startsWith("token="))
      ?.split("=")[1];
    if (!token) return next(new Error("Unauthorized"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded._id;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

// Track online users: userId (string) → Set of socketIds
const onlineUsers = new Map();

io.on("connection", (socket) => {
  const uid = socket.userId.toString();
  socket.join(uid);

  // ── Online presence ──────────────────────────────────────────
  if (!onlineUsers.has(uid)) onlineUsers.set(uid, new Set());
  onlineUsers.get(uid).add(socket.id);
  // Notify everyone that this user came online
  socket.broadcast.emit("user_online", { userId: uid });

  // Let a client ask if a specific user is currently online
  socket.on("check_online", ({ userId }) => {
    const id = userId?.toString();
    const online = onlineUsers.has(id) && onlineUsers.get(id).size > 0;
    socket.emit("online_status", { userId: id, online });
  });

  // ── Typing indicators ─────────────────────────────────────────
  socket.on("typing_start", ({ receiverId }) => {
    if (receiverId) socket.to(receiverId.toString()).emit("user_typing", { userId: uid });
  });

  socket.on("typing_stop", ({ receiverId }) => {
    if (receiverId) socket.to(receiverId.toString()).emit("user_stopped_typing", { userId: uid });
  });

  // ── Read receipts ─────────────────────────────────────────────
  socket.on("mark_read", async ({ senderId }) => {
    try {
      if (!senderId) return;
      await Message.updateMany(
        { senderId, receiverId: socket.userId, readAt: null },
        { readAt: new Date() }
      );
      // Tell the original sender their messages have been read
      socket.to(senderId.toString()).emit("messages_read", { by: uid });
    } catch (err) {
      console.error("mark_read error:", err.message);
    }
  });

  // ── Send message ──────────────────────────────────────────────
  socket.on("send_message", async ({ receiverId, text }) => {
    try {
      if (!receiverId || !text?.trim()) return;

      const connected = await ConnectionRequest.findOne({
        status: "accepted",
        $or: [
          { fromUserId: socket.userId, toUserId: receiverId },
          { fromUserId: receiverId, toUserId: socket.userId },
        ],
      });
      if (!connected) return;

      const msg = await Message.create({
        senderId: socket.userId,
        receiverId,
        text: text.trim(),
      });

      // Deliver to receiver's room; confirm to sender only
      socket.to(receiverId.toString()).emit("receive_message", msg);
      socket.emit("message_sent", msg);
    } catch (err) {
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // ── Disconnect ────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const sockets = onlineUsers.get(uid);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(uid);
        socket.broadcast.emit("user_offline", { userId: uid });
      }
    }
  });

  // ── WebRTC call signaling ─────────────────────────────────────
  socket.on("call_offer", async ({ receiverId, offer, callType }) => {
    try {
      if (!receiverId || !offer) return;
      const connected = await ConnectionRequest.findOne({
        status: "accepted",
        $or: [
          { fromUserId: socket.userId, toUserId: receiverId },
          { fromUserId: receiverId, toUserId: socket.userId },
        ],
      });
      if (!connected) return;
      const caller = await User.findById(socket.userId).select("firstName lastName photoUrl").lean();
      socket.to(receiverId.toString()).emit("incoming_call", {
        from: uid,
        offer,
        callType,
        callerName: `${caller.firstName || ""} ${caller.lastName || ""}`.trim(),
        callerAvatar: caller.photoUrl || "",
      });
    } catch (err) {
      console.error("call_offer error:", err.message);
    }
  });

  socket.on("call_answer", ({ callerId, answer }) => {
    if (callerId && answer) socket.to(callerId.toString()).emit("call_answered", { answer });
  });

  socket.on("ice_candidate", ({ peerId, candidate }) => {
    if (peerId && candidate) socket.to(peerId.toString()).emit("ice_candidate", { candidate, from: uid });
  });

  socket.on("call_reject", ({ callerId }) => {
    if (callerId) socket.to(callerId.toString()).emit("call_rejected", { by: uid });
  });

  socket.on("call_end", ({ peerId }) => {
    if (peerId) socket.to(peerId.toString()).emit("call_ended", { by: uid });
  });
});

const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
const userRouter = require("./routes/userRouter");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chatRouter");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

// Database Connection
connectionDB()
  .then(() => {
    console.log("✅ Database Connection is Successfully...");
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ Database Cannot be connected....", err.message);
  });






















// // Sample user data (mocked like a database)
