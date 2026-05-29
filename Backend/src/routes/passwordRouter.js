const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Otp = require("../models/otp");
const { sendOtpEmail } = require("../utils/mailer");

const passwordRouter = express.Router();

function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

// POST /auth/forgot-password — send OTP to email
passwordRouter.post("/auth/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "email is required" });

        // Always respond success to prevent email enumeration attacks
        const user = await User.findOne({ emailId: email.toLowerCase().trim() });
        if (!user) {
            return res.json({ success: true, message: "If that email exists, an OTP was sent." });
        }

        // Delete any existing OTPs for this email
        await Otp.deleteMany({ email: email.toLowerCase().trim() });

        const code = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await Otp.create({ email: email.toLowerCase().trim(), code, expiresAt });
        await sendOtpEmail(email, code);

        res.json({ success: true, message: "If that email exists, an OTP was sent." });
    } catch (err) {
        console.error("[auth/forgot-password]", err.message);
        res.status(500).json({ message: "Failed to process request" });
    }
});

// POST /auth/verify-otp — verify OTP code (returns a one-time reset token)
passwordRouter.post("/auth/verify-otp", async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ message: "email and code are required" });

        const record = await Otp.findOne({
            email: email.toLowerCase().trim(),
            code,
            expiresAt: { $gt: new Date() },
        });

        if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });

        // Mark OTP as used by deleting it
        await Otp.deleteOne({ _id: record._id });

        // Issue a short-lived JWT as a reset token (5 min)
        const jwt = require("jsonwebtoken");
        const resetToken = jwt.sign(
            { purpose: "password_reset", email: email.toLowerCase().trim() },
            process.env.JWT_SECRET,
            { expiresIn: "5m" }
        );

        res.json({ success: true, resetToken });
    } catch (err) {
        res.status(500).json({ message: "OTP verification failed" });
    }
});

// POST /auth/reset-password — set new password using reset token
passwordRouter.post("/auth/reset-password", async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: "resetToken and newPassword are required" });
        }

        const jwt = require("jsonwebtoken");
        let payload;
        try {
            payload = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        if (payload.purpose !== "password_reset") {
            return res.status(400).json({ message: "Invalid token purpose" });
        }

        const validator = require("validator");
        if (!validator.isStrongPassword(newPassword)) {
            return res.status(400).json({ message: "Password is not strong enough" });
        }

        const user = await User.findOne({ emailId: payload.email });
        if (!user) return res.status(404).json({ message: "User not found" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ success: true, message: "Password reset successfully" });
    } catch (err) {
        res.status(500).json({ message: "Password reset failed" });
    }
});

module.exports = passwordRouter;
