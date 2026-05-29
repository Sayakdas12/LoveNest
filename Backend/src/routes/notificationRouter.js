const express = require("express");
const { userauth } = require("../middlewares/auth");
const Notification = require("../models/notification");

const notificationRouter = express.Router();

// GET /notifications — fetch unread + recent notifications for current user
notificationRouter.get("/notifications", userauth, async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

        res.json({ success: true, data: notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
});

// PATCH /notifications/read — mark all as read
notificationRouter.patch("/notifications/read", userauth, async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to mark notifications as read" });
    }
});

// PATCH /notifications/:id/read — mark single notification as read
notificationRouter.patch("/notifications/:id/read", userauth, async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { read: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to mark notification as read" });
    }
});

// DELETE /notifications/:id — delete a single notification
notificationRouter.delete("/notifications/:id", userauth, async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete notification" });
    }
});

/**
 * Helper — create a notification (called from other routers/socket handlers).
 * @param {object} opts - { userId, type, data }
 */
async function createNotification({ userId, type, data = {} }) {
    try {
        return await Notification.create({ user: userId, type, data });
    } catch (err) {
        console.error("[notification] create error:", err.message);
    }
}

module.exports = notificationRouter;
module.exports.createNotification = createNotification;
