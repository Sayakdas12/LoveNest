const bcrypt = require("bcrypt");
const User = require("../../models/user");

const userResolvers = {
  Query: {
    me: async (_, __, context) => {
      context.requireAuth();
      return context.user;
    },
  },

  Mutation: {
    login: async (_, { emailId, password }, { res }) => {
      const user = await User.findOne({ emailId });
      if (!user) {
        const err = new Error("Invalid credentials");
        err.extensions = { code: "BAD_USER_INPUT" };
        throw err;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const err = new Error("Invalid credentials");
        err.extensions = { code: "BAD_USER_INPUT" };
        throw err;
      }

      const token = await user.getJWT();
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return { user, message: "Login successful" };
    },

    logout: async (_, __, { res, requireAuth }) => {
      requireAuth();
      res.clearCookie("token");
      return true;
    },

    editProfile: async (_, { input }, context) => {
      context.requireAuth();
      const allowedFields = ["firstName", "lastName", "age", "gender", "About", "Skills", "photoUrl"];
      allowedFields.forEach((key) => {
        if (input[key] !== undefined) {
          context.user[key] = input[key];
        }
      });
      await context.user.save();
      return context.user;
    },

    changePassword: async (_, { currentPassword, newPassword }, context) => {
      context.requireAuth();
      const isMatch = await bcrypt.compare(currentPassword, context.user.password);
      if (!isMatch) {
        const err = new Error("Current password is incorrect.");
        err.extensions = { code: "BAD_USER_INPUT" };
        throw err;
      }
      context.user.password = await bcrypt.hash(newPassword, 10);
      await context.user.save();
      return true;
    },

    enrollFaceLock: async (_, { descriptor }, context) => {
      context.requireAuth();
      context.user.faceDescriptor = descriptor;
      context.user.faceDescriptorEnabled = true;
      await context.user.save();
      return true;
    },
  },
};

module.exports = userResolvers;
