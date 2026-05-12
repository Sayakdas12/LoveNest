// const auth = (req, res, next) => {
//   console.log("Admin auth is getting checked...!");
//   const token = "sayak";
//   const isAdminAuth = token === "sayak";
//   if (!isAdminAuth) {
//     res.status(401).send("Unauthorized Request");
//   } else {
//     next();
//   }
// };

const jwt = require("jsonwebtoken");
const User = require("../models/user")


const userauth = async (req, res, next) => {
  console.log("👉 [userauth] Middleware hit");
  try {
    const { token } = req.cookies;
    if (!token) {
      console.log("❌ No token");
      return res.status(401).json({ error: "Please login" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    console.log("✅ Auth successful");

    next(); // ✅ CRUCIAL
  } catch (err) {
    console.log("❌ Auth error:", err);
    res.status(401).json({ error: "Unauthorized: " + err.message });
  }
};


module.exports = {
  userauth
}