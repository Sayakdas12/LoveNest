const jwt = require("jsonwebtoken");
const User = require("../models/user");

/**
 * Apollo Server context function.
 * Extracts the JWT from the request cookie, verifies it, and attaches the
 * full User document to context so resolvers can call `context.requireAuth()`.
 */
async function context({ req, res }) {
  let user = null;

  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decoded._id);
    }
  } catch {
    // Invalid / expired token — user stays null; resolvers decide what to allow
  }

  return {
    req,
    res,
    user,
    /** Throws if the caller is not authenticated */
    requireAuth() {
      if (!user) {
        const err = new Error("You must be logged in to perform this action.");
        err.extensions = { code: "UNAUTHENTICATED" };
        throw err;
      }
      return user;
    },
    /** Throws if the caller is not an admin */
    requireAdmin() {
      this.requireAuth();
      if (user.role !== "admin") {
        const err = new Error("You do not have permission to perform this action.");
        err.extensions = { code: "FORBIDDEN" };
        throw err;
      }
      return user;
    },
  };
}

module.exports = context;
