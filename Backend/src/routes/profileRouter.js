const { userauth } = require("../middlewares/auth");
const user = require("../models/user");
const bcrypt = require("bcrypt");
const {validateEditProfileData} = require("../utils/validation");
const multer = require("multer");
const { uploadToCloudinary } = require("../utils/cloudinary");

const express = require('express');

// Memory storage — file buffer is sent directly to Cloudinary
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        cb(null, file.mimetype.startsWith("image/"));
    },
});

const profileRouter = express.Router();

profileRouter.get("/profile/view", userauth, async (req, res) => { 

   try {
      const user = req.user;

      res.send(user);
   } catch(err){
    res.status(500).send("Error fetching user profile: " + err.message);
   }
 
   
});

profileRouter.patch("/profile/edit", userauth, upload.single("photo"), async (req, res) => {
       try{
      // If a file was uploaded, inject photoUrl into body before validation
      if (req.file) {
          const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
          const result = await uploadToCloudinary(dataUri, { folder: "lovenest/profiles" });
          req.body.photoUrl = result.secure_url;
      }

      // Parse Skills if sent as comma-separated string (from FormData)
      if (req.body.Skills && typeof req.body.Skills === 'string') {
          req.body.Skills = req.body.Skills.split(',').map(s => s.trim()).filter(Boolean);
      }

      if  (!validateEditProfileData(req)){
         throw new Error("Invalid Edit Request");
      }

      const loginuser = req.user;

      Object.keys(req.body).forEach((key) => (loginuser[key] = req.body[key]));
      
      await loginuser.save();

      res.json({ message: `${loginuser.firstName}, your profile updated successfully!`, data: loginuser });
      
       } catch (err){
         res.status(400).json({ message: err.message });
       }
});

profileRouter.patch("/profile/password",userauth, async (req, res) => {
 try {
   const { password, newPassword} = req.body;
   if(!password || !newPassword){
      return res.status(400).send ("Both current and new passwords are required.")
   }

   const user = req.user;

   const isMatch = await bcrypt.compare(password, user.password);
   if(!isMatch){
      return res.status(401).send("Current password is incorrect.")
   }

   const hashednewPassword = await bcrypt.hash(newPassword, 10);

   user.password = hashednewPassword;
   await user.save();
       res.send("✅ Password updated successfully.");
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).send("❌ Something went wrong: " + err.message);
  }

 
});

// ── Face Lock ────────────────────────────────────────────────────────────────

// POST /profile/face-lock/enroll — save face descriptor
profileRouter.post("/profile/face-lock/enroll", userauth, async (req, res) => {
    try {
        const { descriptor } = req.body; // Float32Array serialised as plain array
        if (!descriptor || !Array.isArray(descriptor) || descriptor.length === 0) {
            return res.status(400).json({ message: "descriptor array is required" });
        }
        req.user.faceDescriptor = descriptor;
        req.user.faceDescriptorEnabled = true;
        await req.user.save();
        res.json({ success: true, message: "Face lock enrolled" });
    } catch (err) {
        res.status(500).json({ message: "Enrolment failed", error: err.message });
    }
});

// POST /profile/face-lock/verify — verify a face descriptor against stored
profileRouter.post("/profile/face-lock/verify", userauth, async (req, res) => {
    try {
        const { descriptor } = req.body;
        if (!descriptor || !Array.isArray(descriptor)) {
            return res.status(400).json({ message: "descriptor is required" });
        }
        if (!req.user.faceDescriptorEnabled || !req.user.faceDescriptor?.length) {
            return res.status(400).json({ message: "Face lock not enrolled" });
        }

        // Euclidean distance between two 128-dim descriptors
        const stored = req.user.faceDescriptor;
        let sum = 0;
        for (let i = 0; i < stored.length; i++) {
            sum += (stored[i] - descriptor[i]) ** 2;
        }
        const distance = Math.sqrt(sum);
        const match = distance < 0.6; // face-api.js recommended threshold

        res.json({ success: true, match, distance });
    } catch (err) {
        res.status(500).json({ message: "Verification failed", error: err.message });
    }
});

// PATCH /profile/face-lock/settings — toggle enabled, set inactivity minutes
profileRouter.patch("/profile/face-lock/settings", userauth, async (req, res) => {
    try {
        const { enabled, inactivityMinutes } = req.body;
        if (enabled !== undefined) req.user.faceDescriptorEnabled = Boolean(enabled);
        if (inactivityMinutes !== undefined) {
            req.user.faceLockInactivityMinutes = Math.max(1, Math.min(60, Number(inactivityMinutes)));
        }
        await req.user.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to update settings" });
    }
});

// POST /profile/chat-lock — set or update chat lock password
profileRouter.post("/profile/chat-lock", userauth, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ message: "password is required" });

        const bcrypt = require("bcrypt");
        req.user.chatLockPassword = await bcrypt.hash(password, 10);
        await req.user.save();
        res.json({ success: true, message: "Chat lock password set" });
    } catch (err) {
        res.status(500).json({ message: "Failed to set chat lock password" });
    }
});

// POST /profile/chat-lock/verify — verify chat lock password
profileRouter.post("/profile/chat-lock/verify", userauth, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ message: "password is required" });
        if (!req.user.chatLockPassword) {
            return res.status(400).json({ message: "Chat lock not set" });
        }
        const bcrypt = require("bcrypt");
        const match = await bcrypt.compare(password, req.user.chatLockPassword);
        res.json({ success: true, match });
    } catch (err) {
        res.status(500).json({ message: "Verification failed" });
    }
});

module.exports = profileRouter;