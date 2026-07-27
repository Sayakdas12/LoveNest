const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { getCachedUser, setCachedUser } = require("../utils/redis");

const userauth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ error: "Please login" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id;

    // 1. Try Redis cache first
    let user = await getCachedUser(userId);

    if (!user) {
      // 2. Cache miss — fetch from MongoDB
      user = await User.findById(userId);
      if (!user) return res.status(401).json({ error: "User not found" });
      // 3. Cache for next requests
      await setCachedUser(userId, user.toObject());
    } else {
      // Rehydrate plain object back to a usable form (keep Mongoose-like shape)
      // We still need .save() to work on mutations — fetch from DB in those routes
      user._fromCache = true;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized: " + err.message });
  }
};

module.exports = { userauth };