const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        emoji: { type: String, required: true },
    },
    { _id: false }
);

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            default: "",
            trim: true,
            maxlength: 2000,
        },
        type: {
            type: String,
            enum: ['text', 'image', 'gif', 'voice', 'file', 'sticker', 'system'],
            default: 'text',
        },
        readAt: {
            type: Date,
            default: null,
        },
        // ── Media ──────────────────────────────────────────────────────────
        mediaUrl: { type: String, default: null },       // image / gif
        audioUrl: { type: String, default: null },       // voice message
        audioDuration: { type: Number, default: null },  // seconds
        fileUrl: { type: String, default: null },        // document / any file
        fileName: { type: String, default: null },
        fileSize: { type: Number, default: null },       // bytes
        stickerId: { type: String, default: null },      // sticker identifier

        // ── Rich messaging features ────────────────────────────────────────
        reactions: { type: [reactionSchema], default: [] },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        pinned: { type: Boolean, default: false },
        pinnedAt: { type: Date, default: null },
        bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        editedAt: { type: Date, default: null },
        deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // soft-delete per user
        deletedForAll: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Index for fast chat history lookup
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ receiverId: 1, senderId: 1 });

module.exports = mongoose.model("Message", messageSchema);
