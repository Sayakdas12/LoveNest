

// Create Razorpay payment order
const express = require('express');
const { userauth } = require('../middlewares/auth');
const razorpayInstance = require('../utils/razorPay');
const Payment = require('../models/payment');
const { membershipAmounts } = require('../utils/constants');


const paymentRouter = express.Router();

paymentRouter.post('/payment/create', userauth, async (req, res) => {
    try {


        const { membershipType } = req.body;
        const { firstName, lastName, emailId } = req.user;

        const order = await razorpayInstance.orders.create({
            amount: membershipAmounts[membershipType] * 100,
            currency: 'INR',
            receipt: 'receipt#1',
            notes: {
                firstName,
                lastName,
                emailId,
                membershipType: membershipType,
            },
        });


        const paymentData = new Payment({
            userId: req.user._id,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            status: order.status || 'active',
            receipt: order.receipt,
            notes: order.notes,
            paymentMethod: 'UPI',
            paymentStatus: 'Pending',
        });

        const savedPayment = await paymentData.save();
        return res.status(200).json({ success: true, payment: savedPayment, keyid: process.env.RAZORPAY_KEY_ID, });
    } catch (err) {
        console.error('🔴 Razorpay error:', err);
        res.status(500).json({ success: false, message: 'Error processing payment', error: err.message });
    }
});

module.exports = paymentRouter;




paymentRouter.post('/payment/verify', userauth, async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const generatedSignature = razorpayInstance.utils.generateSignature(razorpayOrderId, razorpayPaymentId);

    if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    try {
        const paymentData = await Payment.findOne({ orderId: razorpayOrderId });

        if (!paymentData) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        paymentData.paymentId = razorpayPaymentId;
        paymentData.paymentStatus = 'Completed';
        await paymentData.save();

        res.status(200).json({ success: true, message: 'Payment verified successfully', payment: paymentData });
    } catch (err) {
        console.error('🔴 Error verifying payment:', err);
        res.status(500).json({ success: false, message: 'Error verifying payment', error: err.message });
    }
});

module.exports = paymentRouter;
