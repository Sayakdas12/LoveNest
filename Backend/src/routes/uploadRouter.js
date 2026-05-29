const express = require("express");
const multer = require("multer");
const { userauth } = require("../middlewares/auth");
const { uploadToCloudinary } = require("../utils/cloudinary");

const uploadRouter = express.Router();

// Use memory storage — we stream the buffer directly to Cloudinary
const memStorage = multer.memoryStorage();
const upload = multer({
    storage: memStorage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
    fileFilter(req, file, cb) {
        // Accept images, audio, video, and common document types
        const allowed = [
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "audio/webm", "audio/ogg", "audio/mpeg", "audio/mp4",
            "video/mp4", "video/webm",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ];
        cb(null, allowed.includes(file.mimetype));
    },
});

// POST /upload/media — upload a file to Cloudinary, returns { url, publicId, resourceType }
uploadRouter.post("/upload/media", userauth, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file provided or unsupported type" });
        }

        const mimeType = req.file.mimetype;
        let resourceType = "auto";
        let folder = "lovenest/media";

        if (mimeType.startsWith("audio/")) {
            resourceType = "video"; // Cloudinary handles audio under "video"
            folder = "lovenest/audio";
        } else if (mimeType.startsWith("image/")) {
            resourceType = "image";
            folder = "lovenest/images";
        } else {
            resourceType = "raw";
            folder = "lovenest/files";
        }

        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        const result = await uploadToCloudinary(dataUri, {
            folder,
            resource_type: resourceType,
            public_id: `${req.user._id}_${Date.now()}`,
        });

        res.json({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            bytes: result.bytes,
            duration: result.duration || null, // populated for audio/video
        });
    } catch (err) {
        console.error("[upload/media]", err.message);
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
});

module.exports = uploadRouter;
