

// Create Razorpay payment order
const express = require('express');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const { userauth } = require('../middlewares/auth');
const razorpayInstance = require('../utils/razorPay');
const Payment = require('../models/payment');
const { membershipAmounts } = require('../utils/constants');
const User = require('../models/user');

// Membership duration in days
const membershipDuration = {
    Essential: 30,
    Premium: 90,
};

const paymentRouter = express.Router();

paymentRouter.post('/payment/create', userauth, async (req, res) => {
    try {
        const { membershipType } = req.body;
        const { firstName, lastName, emailId } = req.user;

        const order = await razorpayInstance().orders.create({
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



paymentRouter.post('/payment/webhook', async (req, res) => {
  const webhookSignature = req.headers['x-razorpay-signature'];

  try {
    // ✅ Validate webhook signature
    const webhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!webhookValid) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const paymentDetails = req.body.payload.payment.entity;

    // ✅ Find payment by order ID
    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // ✅ Update payment status
    payment.status = paymentDetails.status;
    await payment.save();

    // ✅ Update user subscription
    const user = await User.findById(payment.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (event === 'payment.captured') {
      const days = membershipDuration[payment.notes.membershipType] || 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      user.isPremium = true;
      user.membershiptype = payment.notes.membershipType;
      user.membershipExpiry = expiryDate;
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: 'Payment captured & user updated', payment });
    }

    if (event === 'payment.failed') {
      return res
        .status(400)
        .json({ success: false, message: 'Payment failed', payment });
    }

    // ✅ If it's another event (not captured or failed)
    return res.status(200).json({ success: true, message: 'Webhook received', event });
  } catch (err) {
    console.error('🔴 Error updating payment:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error updating payment', error: err.message });
  }
});

paymentRouter.get('/payment/varify', userauth, async (req, res) => {
    try {
        const user = req.user;
        if(user.isPremium) {
            return res.json({ isPremium: true, message: "You are a premium user." });
        }
        return res.json({ isPremium: false, message: "You are not a premium user." });

    } catch (err) {
        console.error("Error verifying payment:", err);
        res.status(500).json({ success: false, message: "Error verifying payment", error: err.message });
    }
});



 module.exports = paymentRouter;    
