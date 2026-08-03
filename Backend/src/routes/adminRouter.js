const express = require("express");
const { userauth } = require("../middlewares/auth");
const adminAuth = require("../middlewares/adminAuth");
const User = require("../models/user");
const Message = require("../models/message");
const Call = require("../models/call");
const ConnectionRequest = require("../models/connectionRequest");

const adminRouter = express.Router();

// All admin routes require authentication + admin role
adminRouter.use("/admin", userauth, adminAuth);

// GET /admin/stats — aggregate platform statistics
adminRouter.get("/admin/stats", async (req, res) => {
    try {
        const [totalUsers, premiumUsers, totalMessages, totalConnections, totalCalls] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isPremium: true }),
            Message.countDocuments(),
            ConnectionRequest.countDocuments({ status: "accepted" }),
            Call.countDocuments(),
        ]);

        const newUsersToday = await User.countDocuments({
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        });

        res.json({
            success: true,
            data: { totalUsers, premiumUsers, totalMessages, totalConnections, totalCalls, newUsersToday },
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch stats" });
    }
});

// GET /admin/users — paginated user list with optional search
adminRouter.get("/admin/users", async (req, res) => {
    try {
        const { page = 1, limit = 20, search = "", role } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { emailId: { $regex: search, $options: "i" } },
            ];
        }
        if (role) filter.role = role;

        const [users, total] = await Promise.all([
            User.find(filter)
                .select("-password -faceDescriptor -chatLockPassword")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            User.countDocuments(filter),
        ]);

        res.json({ success: true, data: users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

// PATCH /admin/users/:id — update user (role, deactivate, etc.)
adminRouter.patch("/admin/users/:id", async (req, res) => {
    try {
        const allowedFields = ["role", "isPremium", "membershiptype", "membershipExpiry"];
        const update = {};
        allowedFields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true, select: "-password -faceDescriptor -chatLockPassword" }
        );
        if (!updated) return res.status(404).json({ message: "User not found" });

        res.json({ success: true, user: updated });
    } catch (err) {
        res.status(500).json({ message: "Failed to update user" });
    }
});

// DELETE /admin/users/:id — delete a user account
adminRouter.delete("/admin/users/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete user" });
    }
});

// GET /admin/calls — paginated call history (platform-wide)
adminRouter.get("/admin/calls", async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [calls, total] = await Promise.all([
            Call.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate("callerId", "firstName lastName photoUrl")
                .populate("receiverId", "firstName lastName photoUrl")
                .lean(),
            Call.countDocuments(),
        ]);

        res.json({ success: true, data: calls, total });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch calls" });
    }
});

// DELETE /admin/messages/:id — moderate/delete a message
adminRouter.delete("/admin/messages/:id", async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete message" });
    }
});

// GET /admin/moderation-logs — fetch toxicity logs for admin review
adminRouter.get("/admin/moderation-logs", async (req, res) => {
    try {
        const ModerationLog = require("../models/moderationLog");
        const logs = await ModerationLog.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate("userId", "firstName lastName photoUrl emailId")
            .populate("targetUserId", "firstName lastName photoUrl")
            .lean();
        res.json({ success: true, data: logs });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch moderation logs", error: err.message });
    }
});

// POST /admin/users/:id/fake-check — manual re-check for fake profile score
adminRouter.post("/admin/users/:id/fake-check", async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ message: "User not found" });

        const [requestCount, messageCount] = await Promise.all([
            ConnectionRequest.countDocuments({ fromUserId: targetUser._id }),
            Message.countDocuments({ senderId: targetUser._id }),
        ]);

        const accountAgeHours = (new Date() - targetUser.createdAt) / (1000 * 60 * 60);

        const { callML } = require("../utils/mlClient");
        const result = await callML("/ml/detect-fake", {
            user: {
                _id: targetUser._id.toString(),
                photoUrl: targetUser.photoUrl,
                About: targetUser.About,
                age: targetUser.age,
                createdAt: targetUser.createdAt,
                Skills: targetUser.Skills || [],
            },
            requestCount,
            messageCount,
            accountAgeHours,
        }, 5000);

        if (result) {
            targetUser.suspiciousScore = result.confidence;
            targetUser.suspiciousReasons = result.reasons;
            await targetUser.save();
        }

        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ message: "Failed to check user", error: err.message });
    }
});

module.exports = adminRouter;
