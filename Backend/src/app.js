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

io.on("connection", (socket) => {
  socket.join(socket.userId.toString());

  socket.on("send_message", async ({ receiverId, text }) => {
    try {
      if (!receiverId || !text?.trim()) return;

      // Only allow messaging between accepted connections
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

      // Deliver to receiver's room (if online) and confirm to sender
      io.to(receiverId).emit("receive_message", msg);
      socket.emit("message_sent", msg);
    } catch (err) {
      socket.emit("error", { message: "Failed to send message" });
    }
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
