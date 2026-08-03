const mongoose = require("mongoose");
const ConnectionRequest = require("../../models/connectionRequest");
const Message = require("../../models/message");
const { callML } = require("../../utils/mlClient");

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

const chatResolvers = {
  Query: {
    chatHistory: async (_, { userId, before, limit = 30 }, context) => {
      context.requireAuth();

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        const err = new Error("Invalid user ID");
        err.extensions = { code: "BAD_USER_INPUT" };
        throw err;
      }

      const ok = await areConnected(context.user._id, userId);
      if (!ok) {
        const err = new Error("You are not connected with this user.");
        err.extensions = { code: "FORBIDDEN" };
        throw err;
      }

      const limitNum = Math.min(parseInt(limit) || 30, 50);

      const query = {
        $or: [
          { senderId: context.user._id, receiverId: userId },
          { senderId: userId, receiverId: context.user._id },
        ],
      };

      if (before && mongoose.Types.ObjectId.isValid(before)) {
        const pivot = await Message.findById(before).lean();
        if (pivot) query.createdAt = { $lt: pivot.createdAt };
      }

      const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .lean();

      return messages.reverse();
    },

    // ── Feature 7: Chat Sentiment Analysis (Premium) ─────────────────────────────────────
    chatSentiment: async (_, { userId }, context) => {
      context.requireAuth();

      // Premium gate
      if (!context.user.isPremium) {
        const err = new Error("Chat sentiment analysis is a Premium feature.");
        err.extensions = { code: "FORBIDDEN" };
        throw err;
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        const err = new Error("Invalid user ID");
        err.extensions = { code: "BAD_USER_INPUT" };
        throw err;
      }

      // Verify connection
      const ok = await areConnected(context.user._id, userId);
      if (!ok) {
        const err = new Error("You are not connected with this user.");
        err.extensions = { code: "FORBIDDEN" };
        throw err;
      }

      // Fetch last 50 text messages
      const myId = context.user._id.toString();
      const messages = await Message.find({
        $or: [
          { senderId: context.user._id, receiverId: userId },
          { senderId: userId, receiverId: context.user._id },
        ],
        type: "text",
        deletedForAll: { $ne: true },
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      const payload = messages.map((m) => ({
        text: m.text || "",
        senderId: m.senderId.toString() === myId ? "me" : "them",
      }));

      const result = await callML("/ml/chat-sentiment", { messages: payload }, 5000);

      // Return null gracefully if ML is down — client handles null
      return result || null;
    },
  },

  Mutation: {
    reactToMessage: async (_, { userId, msgId, emoji }, context) => {
      context.requireAuth();

      const ok = await areConnected(context.user._id, userId);
      if (!ok) {
        const err = new Error("Not connected");
        err.extensions = { code: "FORBIDDEN" };
        throw err;
      }

      const msg = await Message.findById(msgId);
      if (!msg) {
        const err = new Error("Message not found");
        err.extensions = { code: "NOT_FOUND" };
        throw err;
      }

      const existing = msg.reactions.find(
        (r) => r.userId.toString() === context.user._id.toString() && r.emoji === emoji
      );
      if (existing) {
        msg.reactions = msg.reactions.filter(
          (r) => !(r.userId.toString() === context.user._id.toString() && r.emoji === emoji)
        );
      } else {
        msg.reactions.push({ userId: context.user._id, emoji });
      }
      return msg.save();
    },

    pinMessage: async (_, { msgId }, context) => {
      context.requireAuth();
      const msg = await Message.findById(msgId);
      if (!msg) {
        const err = new Error("Message not found");
        err.extensions = { code: "NOT_FOUND" };
        throw err;
      }

      const myId = context.user._id.toString();
      if (msg.senderId.toString() !== myId && msg.receiverId.toString() !== myId) {
        const err = new Error("Forbidden");
        err.extensions = { code: "FORBIDDEN" };
        throw err;
      }

      msg.pinned = !msg.pinned;
      msg.pinnedAt = msg.pinned ? new Date() : null;
      return msg.save();
    },

    bookmarkMessage: async (_, { msgId }, context) => {
      context.requireAuth();
      const msg = await Message.findById(msgId);
      if (!msg) {
        const err = new Error("Message not found");
        err.extensions = { code: "NOT_FOUND" };
        throw err;
      }

      const myId = context.user._id.toString();
      const alreadyBookmarked = msg.bookmarkedBy.map((id) => id.toString()).includes(myId);
      if (alreadyBookmarked) {
        msg.bookmarkedBy = msg.bookmarkedBy.filter((id) => id.toString() !== myId);
      } else {
        msg.bookmarkedBy.push(context.user._id);
      }
      return msg.save();
    },
  },
};

module.exports = chatResolvers;
