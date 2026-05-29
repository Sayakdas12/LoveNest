/**
 * Admin auth middleware — verifies the authenticated user has role "admin".
 * Must be used AFTER the `userauth` middleware so req.user is already populated.
 */
module.exports = function adminAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};
