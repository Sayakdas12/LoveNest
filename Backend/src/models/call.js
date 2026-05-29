const mongoose = require("mongoose");

const callSchema = new mongoose.Schema(
    {
        callId: {
            type: String,
            required: true,
            unique: true,
        },
        callerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["audio", "video"],
            required: true,
        },
        status: {
            type: String,
            enum: ["completed", "missed", "rejected", "ongoing"],
            default: "ongoing",
        },
        duration: {
            type: Number, // seconds
            default: 0,
        },
        startedAt: { type: Date, default: null },
        endedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

callSchema.index({ callerId: 1 });
callSchema.index({ receiverId: 1 });

module.exports = mongoose.model("Call", callSchema);
