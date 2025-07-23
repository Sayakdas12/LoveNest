const mongoose = require("mongoose");
const { isCurrency } = require("validator");

const paymentSchema = new mongoose.Schema({

    orderId: {
        type: String,
        required: true,
    },
    paymentId: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ["UPI", "Card", "Net Banking", "Wallet"],
    },
    paymentStatus:{
        type:String,
        required: true,
        enum: ["Pending", "Completed", "Failed"],
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        validate(value) {
            if (!isCurrency(value, { allow_negatives: false })) {
                throw new Error("Invalid currency format");
            }
        },
    },
    status: {
        type: String,
        required: true,
        default: "active",
    },




}, {timestamp: true});

const Payment = mongoose.model("Payment", paymentSchema);
