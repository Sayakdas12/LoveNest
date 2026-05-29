
const express = require("express");
const multer = require("multer");

const authRouter = express.Router();
const User = require("../models/user");
const { validateSignup } = require("../utils/validation");
const bcrypt = require("bcrypt");
const { uploadToCloudinary } = require("../utils/cloudinary");
const { getAdminApp } = require("../utils/firebase-admin");

// Memory storage — buffer is uploaded directly to Cloudinary
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        cb(null, file.mimetype.startsWith("image/"));
    },
});

authRouter.post("/signup", upload.single("photo"), async (req, res) => {
    try {
        validateSignup(req);

        const { firstName, lastName, emailId, password, age, gender, about } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);

        const existing = await User.findOne({ emailId });
        if (existing) {
            return res.status(400).send("User with this email already exists");
        }

        const userFields = {
            firstName,
            lastName,
            emailId,
            password: passwordHash,
        };

        if (age) userFields.age = Number(age);
        if (gender) userFields.gender = gender;
        if (about) userFields.About = about;
        if (req.body.skills) {
            // accept comma-separated string "Yoga,Travel" or JSON array
            if (Array.isArray(req.body.skills)) {
                userFields.Skills = req.body.skills;
            } else {
                userFields.Skills = req.body.skills.split(",").map(s => s.trim()).filter(Boolean);
            }
        }
        if (req.file) {
            const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
            const result = await uploadToCloudinary(dataUri, { folder: "lovenest/profiles" });
            userFields.photoUrl = result.secure_url;
        }

        const user = new User(userFields);
        await user.save();

        // Auto-login: generate JWT and set cookie so user lands directly on feed
        const token = await user.getJWT();
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message.replace("Error saving the user: ", "") });
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        // Validate the input
        if (!emailId || !password) {
            return res.status(400).send("Email and password are required");
        }

        // Find the user by email
        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(400).send("User not found in DB");
        }

        // Compare the password with the hashed password in the database
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(400).send("Invalid credentials");
        }

        const token = await user.getJWT();
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        res.send(user);
    } catch (err) {
        res.status(500).send("Error logging in: " + err.message);
    }
});

authRouter.post("/logout", async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
        expires: new Date(0),
    });
 
    res.send("✅ Logout Successfull.");
});

// ── Google OAuth ─────────────────────────────────────────────────────────────
authRouter.post("/auth/google", async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ message: "idToken is required" });

        // Verify Google ID token with Firebase Admin SDK
        const adminApp = getAdminApp();
        if (!adminApp) return res.status(503).json({ message: "Authentication service unavailable" });

        const admin = require("firebase-admin");
        const decoded = await admin.auth().verifyIdToken(idToken);
        const { email, name = "", picture, uid } = decoded;

        if (!email) return res.status(400).json({ message: "No email in Google account" });

        // Split display name into first/last
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0] || "User";
        const lastName  = nameParts.slice(1).join(" ") || "";

        let user = await User.findOne({ emailId: email.toLowerCase() });

        if (user) {
            // Link Google to existing local account if not already linked
            if (!user.googleId) {
                user.googleId     = uid;
                user.authProvider = "google";
                await user.save();
            }
        } else {
            // New user — create without password
            user = new User({
                firstName,
                lastName,
                emailId:      email.toLowerCase(),
                googleId:     uid,
                authProvider: "google",
                ...(picture && { photoUrl: picture }),
            });
            await user.save();
        }

        // Issue same JWT cookie as /login
        const token = await user.getJWT();
        res.cookie("token", token, {
            httpOnly: true,
            secure:   process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
            expires:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        res.json(user);
    } catch (err) {
        res.status(401).json({ message: "Google authentication failed: " + err.message });
    }
});

module.exports = authRouter;









