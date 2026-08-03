const User = require("../../models/user");
const ConnectionRequest = require("../../models/connectionRequest");

const USER_FIELDS = "firstName lastName photoUrl age gender About Skills";

const connectionResolvers = {
  Query: {
    feed: async (_, args, context) => {
      context.requireAuth();
      const { pageNo = 1, limit = 10, minAge, maxAge, gender, skills } = args;
      const skip = (pageNo - 1) * limit;

      // Exclude users already interacted with
      const connectionRequests = await ConnectionRequest.find({
        $or: [
          { fromUserId: context.user._id },
          { toUserId: context.user._id },
        ],
      }).select("fromUserId toUserId");

      const hideUsersFromFeed = new Set([context.user._id.toString()]);
      connectionRequests.forEach((req) => {
        hideUsersFromFeed.add(req.fromUserId.toString());
        hideUsersFromFeed.add(req.toUserId.toString());
      });

      const filter = { _id: { $nin: Array.from(hideUsersFromFeed) } };
      if (minAge) filter.age = { ...filter.age, $gte: minAge };
      if (maxAge) filter.age = { ...filter.age, $lte: maxAge };
      if (gender) filter.gender = gender;
      if (skills && skills.length) filter.Skills = { $in: skills };

      const [users, total] = await Promise.all([
        User.find(filter).select(USER_FIELDS).skip(skip).limit(limit).lean(),
        User.countDocuments(filter),
      ]);

      // ── ML: Feature 1 — Smart Match Scoring & Re-ranking ────────────────────
      const { callML } = require("../../utils/mlClient");
      const mlResult = await callML("/ml/match-score", {
        user: {
          _id: context.user._id?.toString(),
          firstName: context.user.firstName,
          Skills: context.user.Skills || [],
          age: context.user.age,
          About: context.user.About || "",
        },
        candidates: users,
      }, 4000);

      const rankedUsers = mlResult?.ranked || users;

      return {
        users: rankedUsers,
        total,
        page: pageNo,
        totalPages: Math.ceil(total / limit),
      };
    },

    connections: async (_, __, context) => {
      context.requireAuth();
      const connectionRequests = await ConnectionRequest.find({
        $or: [
          { toUserId: context.user._id, status: "accepted" },
          { fromUserId: context.user._id, status: "accepted" },
        ],
      })
        .populate("fromUserId", USER_FIELDS)
        .populate("toUserId", USER_FIELDS);

      return connectionRequests.map((conn) => {
        const isSender = conn.fromUserId._id.toString() === context.user._id.toString();
        return isSender ? conn.toUserId : conn.fromUserId;
      });
    },

    receivedRequests: async (_, __, context) => {
      context.requireAuth();
      return ConnectionRequest.find({
        toUserId: context.user._id,
        status: "interested",
      }).populate("fromUserId", USER_FIELDS);
    },

    notificationsCount: async (_, __, context) => {
      context.requireAuth();
      return ConnectionRequest.countDocuments({
        toUserId: context.user._id,
        status: "interested",
      });
    },
  },

  Mutation: {
    sendRequest: async (_, { toUserId, status }, context) => {
      context.requireAuth();
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        const err = new Error("Invalid status: " + status);
        err.extensions = { code: "BAD_USER_INPUT" };
        throw err;
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        const err = new Error("User not found");
        err.extensions = { code: "NOT_FOUND" };
        throw err;
      }

      const existing = await ConnectionRequest.findOne({
        $or: [
          { fromUserId: context.user._id, toUserId },
          { fromUserId: toUserId, toUserId: context.user._id },
        ],
      });
      if (existing) {
        const err = new Error("Connection request already exists");
        err.extensions = { code: "BAD_USER_INPUT" };
        throw err;
      }

      const newRequest = new ConnectionRequest({
        fromUserId: context.user._id,
        toUserId,
        status,
      });
      return newRequest.save();
    },

    reviewRequest: async (_, { requestId, status }, context) => {
      context.requireAuth();
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        const err = new Error("Invalid review status: " + status);
        err.extensions = { code: "BAD_USER_INPUT" };
        throw err;
      }

      const request = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: context.user._id,
        status: "interested",
      });
      if (!request) {
        const err = new Error("Request not found or already reviewed");
        err.extensions = { code: "NOT_FOUND" };
        throw err;
      }

      request.status = status;
      return request.save();
    },
  },
};

module.exports = connectionResolvers;
