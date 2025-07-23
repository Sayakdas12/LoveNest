// src/models/payment.js
const mongoose = require("mongoose");
const { isCurrency } = require("validator");

const paymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    paymentId: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paymentMethod: {
        type: String,
        required: true,
        enum: ["UPI", "Card", "Net Banking", "Wallet"],
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ["Pending", "Completed", "Failed"],
    },
    amount: { type: Number, required: true },
    currency: {
        type: String,
        required: true,
        enum: ['INR', 'USD', 'EUR'], // Add more codes if needed
    },

    status: { type: String, required: true, default: "active" },
    receipt: { type: String, required: true },
    notes: { type: Object, default: {} },
}, { timestamps: true }); // ✅ timestamps (not 'timestamp')

module.exports = mongoose.model("Payment", paymentSchema); // ✅ Export the model
