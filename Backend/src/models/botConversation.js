const mongoose = require("mongoose");

const botMessageSchema = new mongoose.Schema(
    {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
    },
    { _id: false, timestamps: true }
);

const botConversationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        messages: {
            type: [botMessageSchema],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("BotConversation", botConversationSchema);
