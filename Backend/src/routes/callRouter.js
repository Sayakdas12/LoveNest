const express = require("express");
const { AccessToken } = require("livekit-server-sdk");
const { userauth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const Call = require("../models/call");
const User = require("../models/user");

const callRouter = express.Router();

// POST /call/token — generate a LiveKit JWT for the caller/receiver to join a room
callRouter.post("/call/token", userauth, async (req, res) => {
    try {
        const { roomName, callType, receiverId } = req.body;
        if (!roomName || !callType) {
            return res.status(400).json({ message: "roomName and callType are required" });
        }

        if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
            return res.status(503).json({ message: "LiveKit is not configured" });
        }

        // Verify they are connected (for direct calls between matched users)
        if (receiverId) {
            const conn = await ConnectionRequest.findOne({
                status: "accepted",
                $or: [
                    { fromUserId: req.user._id, toUserId: receiverId },
                    { fromUserId: receiverId, toUserId: req.user._id },
                ],
            });
            if (!conn) return res.status(403).json({ message: "You are not connected with this user" });
        }

        const at = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            {
                identity: req.user._id.toString(),
                name: `${req.user.firstName} ${req.user.lastName || ""}`.trim(),
                ttl: "1h",
            }
        );

        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
        });

        const token = await at.toJwt();
        res.json({ token, livekitUrl: process.env.LIVEKIT_URL });
    } catch (err) {
        console.error("[call/token]", err.message);
        res.status(500).json({ message: "Failed to generate call token", error: err.message });
    }
});

// POST /call/log — save a call record after it ends
callRouter.post("/call/log", userauth, async (req, res) => {
    try {
        const { callId, receiverId, type, status, duration, startedAt, endedAt } = req.body;
        if (!callId || !receiverId || !type) {
            return res.status(400).json({ message: "callId, receiverId and type are required" });
        }

        const existing = await Call.findOne({ callId });
        if (existing) {
            // Update if already exists (e.g., status update on end)
            Object.assign(existing, { status, duration, endedAt });
            await existing.save();
            return res.json({ success: true, call: existing });
        }

        const call = await Call.create({
            callId,
            callerId: req.user._id,
            receiverId,
            type,
            status: status || "ongoing",
            duration: duration || 0,
            startedAt: startedAt || new Date(),
            endedAt: endedAt || null,
        });

        // ── ML: Feature 12 — Post-Call Debrief & Coaching (async / non-blocking) ─────
        if (status === "completed" || status === "ended") {
            setImmediate(async () => {
                try {
                    const { callML } = require("../utils/mlClient");
                    const [caller, receiver, msgCount] = await Promise.all([
                        User.findById(req.user._id).select("firstName Skills About").lean(),
                        User.findById(receiverId).select("firstName Skills About").lean(),
                        Message.countDocuments({
                            $or: [
                                { senderId: req.user._id, receiverId },
                                { senderId: receiverId, receiverId: req.user._id },
                            ],
                        }),
                    ]);

                    const debrief = await callML("/ml/call-debrief", {
                        callDuration: duration || 0,
                        callType: type,
                        callerProfile: caller,
                        receiverProfile: receiver,
                        priorMessageCount: msgCount,
                        callOutcome: status,
                    }, 6000);

                    if (debrief) {
                        await Call.findByIdAndUpdate(call._id, { debrief });
                    }
                } catch {}
            });
        }

        res.status(201).json({ success: true, call });
    } catch (err) {
        res.status(500).json({ message: "Failed to log call", error: err.message });
    }
});

// GET /call/history — paginated call history for current user
callRouter.get("/call/history", userauth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const calls = await Call.find({
            $or: [
                { callerId: req.user._id },
                { receiverId: req.user._id },
            ],
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("callerId", "firstName lastName photoUrl")
            .populate("receiverId", "firstName lastName photoUrl")
            .lean();

        res.json({ success: true, data: calls });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch call history", error: err.message });
    }
});

module.exports = callRouter;
