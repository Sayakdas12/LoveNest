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

// POST /chat/:userId/react/:msgId — add or remove an emoji reaction
chatRouter.post("/chat/:userId/react/:msgId", userauth, async (req, res) => {
    try {
        const { userId, msgId } = req.params;
        const { emoji } = req.body;
        if (!emoji) return res.status(400).json({ message: "emoji is required" });

        const ok = await areConnected(req.user._id, userId);
        if (!ok) return res.status(403).json({ message: "Not connected" });

        const msg = await Message.findById(msgId);
        if (!msg) return res.status(404).json({ message: "Message not found" });

        const existing = msg.reactions.find(r => r.userId.toString() === req.user._id.toString() && r.emoji === emoji);
        if (existing) {
            // Toggle off
            msg.reactions = msg.reactions.filter(r => !(r.userId.toString() === req.user._id.toString() && r.emoji === emoji));
        } else {
            msg.reactions.push({ userId: req.user._id, emoji });
        }
        await msg.save();
        res.json({ success: true, reactions: msg.reactions });
    } catch (err) {
        res.status(500).json({ message: "Failed to update reaction", error: err.message });
    }
});

// PATCH /chat/message/:msgId/pin — pin or unpin a message
chatRouter.patch("/chat/message/:msgId/pin", userauth, async (req, res) => {
    try {
        const msg = await Message.findById(req.params.msgId);
        if (!msg) return res.status(404).json({ message: "Message not found" });

        const myId = req.user._id.toString();
        if (msg.senderId.toString() !== myId && msg.receiverId.toString() !== myId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        msg.pinned = !msg.pinned;
        msg.pinnedAt = msg.pinned ? new Date() : null;
        await msg.save();
        res.json({ success: true, pinned: msg.pinned });
    } catch (err) {
        res.status(500).json({ message: "Failed to pin message", error: err.message });
    }
});

// PATCH /chat/message/:msgId/bookmark — bookmark or remove bookmark
chatRouter.patch("/chat/message/:msgId/bookmark", userauth, async (req, res) => {
    try {
        const msg = await Message.findById(req.params.msgId);
        if (!msg) return res.status(404).json({ message: "Message not found" });

        const myId = req.user._id.toString();
        const alreadyBookmarked = msg.bookmarkedBy.map(id => id.toString()).includes(myId);
        if (alreadyBookmarked) {
            msg.bookmarkedBy = msg.bookmarkedBy.filter(id => id.toString() !== myId);
        } else {
            msg.bookmarkedBy.push(req.user._id);
        }
        await msg.save();
        res.json({ success: true, bookmarked: !alreadyBookmarked });
    } catch (err) {
        res.status(500).json({ message: "Failed to bookmark", error: err.message });
    }
});

// PATCH /chat/message/:msgId/edit — edit message text
chatRouter.patch("/chat/message/:msgId/edit", userauth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text?.trim()) return res.status(400).json({ message: "text is required" });

        const msg = await Message.findById(req.params.msgId);
        if (!msg) return res.status(404).json({ message: "Message not found" });
        if (msg.senderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Can only edit your own messages" });
        }
        if (msg.type !== "text") return res.status(400).json({ message: "Only text messages can be edited" });

        msg.text = text.trim();
        msg.editedAt = new Date();
        await msg.save();
        res.json({ success: true, message: msg });
    } catch (err) {
        res.status(500).json({ message: "Failed to edit message", error: err.message });
    }
});

// DELETE /chat/message/:msgId — soft delete for self or delete for all
chatRouter.delete("/chat/message/:msgId", userauth, async (req, res) => {
    try {
        const { forAll } = req.query; // ?forAll=true
        const msg = await Message.findById(req.params.msgId);
        if (!msg) return res.status(404).json({ message: "Message not found" });

        const myId = req.user._id.toString();

        if (forAll === "true") {
            if (msg.senderId.toString() !== myId) {
                return res.status(403).json({ message: "Only sender can delete for all" });
            }
            msg.deletedForAll = true;
            msg.text = "";
        } else {
            if (!msg.deletedFor.map(id => id.toString()).includes(myId)) {
                msg.deletedFor.push(req.user._id);
            }
        }
        await msg.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete message", error: err.message });
    }
});

// GET /chat/:userId/pinned — fetch pinned messages in a conversation
chatRouter.get("/chat/:userId/pinned", userauth, async (req, res) => {
    try {
        const { userId } = req.params;
        const ok = await areConnected(req.user._id, userId);
        if (!ok) return res.status(403).json({ message: "Not connected" });

        const pinned = await Message.find({
            pinned: true,
            $or: [
                { senderId: req.user._id, receiverId: userId },
                { senderId: userId, receiverId: req.user._id },
            ],
        }).sort({ pinnedAt: -1 }).lean();

        res.json({ success: true, data: pinned });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch pinned messages", error: err.message });
    }
});

// GET /chat/bookmarks — fetch all bookmarked messages for current user
chatRouter.get("/chat/bookmarks/list", userauth, async (req, res) => {
    try {
        const bookmarked = await Message.find({
            bookmarkedBy: req.user._id,
        }).sort({ createdAt: -1 }).lean();

        res.json({ success: true, data: bookmarked });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch bookmarks", error: err.message });
    }
});

module.exports = chatRouter;
