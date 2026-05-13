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

// GET /chat/:userId  — fetch message history with cursor pagination
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

        const { before, limit = 30 } = req.query;
        const limitNum = Math.min(parseInt(limit) || 30, 50);

        const query = {
            $or: [
                { senderId: req.user._id, receiverId: userId },
                { senderId: userId, receiverId: req.user._id },
            ],
        };

        // Cursor: fetch messages older than the given message ID
        if (before && mongoose.Types.ObjectId.isValid(before)) {
            const pivot = await Message.findById(before).lean();
            if (pivot) query.createdAt = { $lt: pivot.createdAt };
        }

        // Fetch one extra to detect if there are more pages
        const raw = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(limitNum + 1)
            .lean();

        const hasMore = raw.length > limitNum;
        const data = raw.slice(0, limitNum).reverse(); // chronological order

        res.json({ success: true, data, hasMore });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch messages", error: err.message });
    }
});

module.exports = chatRouter;
