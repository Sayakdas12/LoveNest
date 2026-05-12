const express = require("express");
const mongoose = require("mongoose");
const { userauth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const Message = require("../models/message");

const chatRouter = express.Router();

// Helper — checks that the two users have an accepted connection
async function areConnected(userA, userB) {
    const conn = await ConnectionRequest.findOne({
        status: "accepted",
        $or: [
            { fromUserId: userA, toUserId: userB },
            { fromUserId: userB, toUserId: userA },
        ],
    });
    return !!conn;
}

// GET /chat/:userId  — fetch message history (last 50 messages)
chatRouter.get("/chat/:userId", userauth, async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const ok = await areConnected(req.user._id, userId);
        if (!ok) {
            return res.status(403).json({ message: "You are not connected with this user." });
        }

        const messages = await Message.find({
            $or: [
                { senderId: req.user._id, receiverId: userId },
                { senderId: userId, receiverId: req.user._id },
            ],
        })
            .sort({ createdAt: 1 })
            .limit(50)
            .lean();

        res.json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch messages", error: err.message });
    }
});

module.exports = chatRouter;
