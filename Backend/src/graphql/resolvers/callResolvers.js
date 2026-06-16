const Call = require("../../models/call");

const callResolvers = {
  Query: {
    callHistory: async (_, { page = 1, limit = 20 }, context) => {
      context.requireAuth();
      const skip = (page - 1) * limit;

      return Call.find({
        $or: [
          { callerId: context.user._id },
          { receiverId: context.user._id },
        ],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("callerId", "firstName lastName photoUrl")
        .populate("receiverId", "firstName lastName photoUrl");
    },
  },
};

module.exports = callResolvers;
