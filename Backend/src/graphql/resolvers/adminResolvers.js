const User = require("../../models/user");
const Message = require("../../models/message");
const Call = require("../../models/call");
const ConnectionRequest = require("../../models/connectionRequest");

const adminResolvers = {
  Query: {
    adminStats: async (_, __, context) => {
      context.requireAdmin();

      const [totalUsers, premiumUsers, totalMessages, totalConnections, totalCalls, newUsersToday] =
        await Promise.all([
          User.countDocuments(),
          User.countDocuments({ isPremium: true }),
          Message.countDocuments(),
          ConnectionRequest.countDocuments({ status: "accepted" }),
          Call.countDocuments(),
          User.countDocuments({
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          }),
        ]);

      return { totalUsers, premiumUsers, totalMessages, totalConnections, totalCalls, newUsersToday };
    },

    adminUsers: async (_, { page = 1, limit = 20, search = "", role }, context) => {
      context.requireAdmin();
      const skip = (page - 1) * limit;

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
          .limit(limit)
          .lean(),
        User.countDocuments(filter),
      ]);

      return { users, total, page, pages: Math.ceil(total / limit) };
    },

    adminCalls: async (_, { page = 1, limit = 20 }, context) => {
      context.requireAdmin();
      const skip = (page - 1) * limit;

      const [calls, total] = await Promise.all([
        Call.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("callerId", "firstName lastName photoUrl")
          .populate("receiverId", "firstName lastName photoUrl")
          .lean(),
        Call.countDocuments(),
      ]);

      return { calls, total };
    },
  },

  Mutation: {
    adminUpdateUser: async (_, { id, input }, context) => {
      context.requireAdmin();
      const allowedFields = ["role", "isPremium", "membershiptype", "membershipExpiry"];
      const update = {};
      allowedFields.forEach((f) => {
        if (input[f] !== undefined) update[f] = input[f];
      });

      const updated = await User.findByIdAndUpdate(id, update, {
        new: true,
        select: "-password -faceDescriptor -chatLockPassword",
      });
      if (!updated) {
        const err = new Error("User not found");
        err.extensions = { code: "NOT_FOUND" };
        throw err;
      }
      return updated;
    },

    adminDeleteUser: async (_, { id }, context) => {
      context.requireAdmin();
      await User.findByIdAndDelete(id);
      return true;
    },

    adminDeleteMessage: async (_, { id }, context) => {
      context.requireAdmin();
      await Message.findByIdAndDelete(id);
      return true;
    },
  },
};

module.exports = adminResolvers;
