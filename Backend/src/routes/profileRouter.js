const { userauth } = require("../middlewares/auth");
const user = require("../models/user");
const bcrypt = require("bcrypt");
const {validateEditProfileData} = require("../utils/validation");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const express = require('express');

// multer setup for profile photo uploads
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `profile_${req.user._id}_${Date.now()}${ext}`);
    },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

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
          req.body.photoUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`;
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

module.exports = profileRouter; 