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
    login: async (_, { emailId, password }, { req, res }) => {
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
      const host = req?.hostname || req?.headers?.host || "";
      const isLocalhost = /localhost|127\.0\.0\.1/i.test(host);
      const useSecureCookie = process.env.NODE_ENV === "production" && !isLocalhost;
      const cookieOptions = {
        httpOnly: true,
        secure: useSecureCookie,
        sameSite: useSecureCookie ? "None" : "Lax",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      res.cookie("token", token, cookieOptions);

      return { user, message: "Login successful" };
    },

    logout: async (_, __, { req, res, requireAuth }) => {
      requireAuth();
      const host = req?.hostname || req?.headers?.host || "";
      const isLocalhost = /localhost|127\.0\.0\.1/i.test(host);
      const useSecureCookie = process.env.NODE_ENV === "production" && !isLocalhost;
      res.clearCookie("token", {
        httpOnly: true,
        secure: useSecureCookie,
        sameSite: useSecureCookie ? "None" : "Lax",
      });
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
