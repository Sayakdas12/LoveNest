const mongoose = require("mongoose");
const ConnectionRequest = require("../../models/connectionRequest");
const Message = require("../../models/message");

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
