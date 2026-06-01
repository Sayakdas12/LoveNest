

// Razorpay payment routes
const express = require('express');
const crypto = require('crypto');
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
    // req.body is a raw Buffer (express.raw middleware in app.js)
    const rawBody = req.body.toString();

    const webhookValid = validateWebhookSignature(
      rawBody,
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!webhookValid) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const { event, payload } = JSON.parse(rawBody);
    console.log(`📦 Razorpay webhook: ${event}`);

    // ── payment.captured / order.paid → activate premium ──────────────────
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      if (!paymentEntity) {
        return res.status(200).json({ success: true, message: 'No payment entity in payload' });
      }

      const payment = await Payment.findOne({ orderId: paymentEntity.order_id });
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment record not found' });
      }

      if (!payment.paymentId) payment.paymentId = paymentEntity.id;
      payment.paymentStatus = 'Completed';
      payment.status = 'captured';
      await payment.save();

      const days = membershipDuration[payment.notes?.membershipType] || 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      await User.findByIdAndUpdate(payment.userId, {
        isPremium: true,
        membershiptype: payment.notes?.membershipType,
        membershipExpiry: expiryDate,
      });

      return res.status(200).json({ success: true, message: `${event} — premium activated` });
    }

    // ── payment.failed → mark as failed ──────────────────────────────────
    if (event === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      if (paymentEntity?.order_id) {
        const payment = await Payment.findOne({ orderId: paymentEntity.order_id });
        if (payment) {
          payment.paymentStatus = 'Failed';
          payment.status = 'failed';
          await payment.save();
        }
      }
      return res.status(200).json({ success: true, message: 'Payment failed event received' });
    }

    // ── refund.processed → revoke premium on full refund ─────────────────
    if (event === 'refund.processed') {
      const refundEntity = payload.refund?.entity;
      const paymentId = refundEntity?.payment_id || payload.payment?.entity?.id;

      if (paymentId) {
        const payment = await Payment.findOne({ paymentId });
        if (payment) {
          payment.status = 'refunded';
          payment.paymentStatus = 'Failed';
          await payment.save();

          // Revoke premium only on full refund
          if (refundEntity && refundEntity.amount >= payment.amount) {
            await User.findByIdAndUpdate(payment.userId, {
              isPremium: false,
              membershiptype: null,
              membershipExpiry: null,
            });
            console.log(`🔄 Premium revoked for user ${payment.userId} after full refund`);
          }
        }
      }
      return res.status(200).json({ success: true, message: 'Refund processed' });
    }

    // ── refund.failed → log only ──────────────────────────────────────────
    if (event === 'refund.failed') {
      console.warn(`⚠️  Refund failed: refundId=${payload.refund?.entity?.id}`);
      return res.status(200).json({ success: true, message: 'Refund failed event noted' });
    }

    // ── any other future events ───────────────────────────────────────────
    return res.status(200).json({ success: true, message: 'Webhook received', event });

  } catch (err) {
    console.error('🔴 Webhook error:', err);
    return res.status(500).json({ success: false, message: 'Error processing webhook', error: err.message });
  }
});

// POST /payment/verify — called by frontend after Razorpay checkout success.
// Verifies HMAC signature, saves paymentId, and activates user premium.
paymentRouter.post('/payment/verify', userauth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
        }

        // HMAC-SHA256 verification: signature = HMAC(order_id + '|' + payment_id)
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        const payment = await Payment.findOne({ orderId: razorpay_order_id, userId: req.user._id });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        // Mark payment as completed
        payment.paymentId = razorpay_payment_id;
        payment.paymentStatus = 'Completed';
        payment.status = 'captured';
        await payment.save();

        // Activate user premium
        const days = membershipDuration[payment.notes?.membershipType] || 30;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);

        await User.findByIdAndUpdate(req.user._id, {
            isPremium: true,
            membershiptype: payment.notes?.membershipType,
            membershipExpiry: expiryDate,
        });

        return res.json({ success: true, message: 'Payment verified. Membership activated!' });
    } catch (err) {
        console.error('🔴 Verify error:', err);
        res.status(500).json({ success: false, message: 'Error verifying payment', error: err.message });
    }
});

// GET /payment/verify — check current user's premium status (fixed typo from /payment/varify)
paymentRouter.get('/payment/verify', userauth, async (req, res) => {
    try {
        const user = req.user;

        // Auto-expire premium if membership period has ended
        if (user.isPremium && user.membershipExpiry && new Date(user.membershipExpiry) < new Date()) {
            user.isPremium = false;
            user.membershiptype = null;
            await user.save();
        }

        if (user.isPremium) {
            return res.json({
                isPremium: true,
                membershipType: user.membershiptype,
                membershipExpiry: user.membershipExpiry,
                message: "You are a premium user.",
            });
        }
        return res.json({ isPremium: false, message: "You are not a premium user." });

    } catch (err) {
        console.error("Error verifying payment:", err);
        res.status(500).json({ success: false, message: "Error verifying payment", error: err.message });
    }
});

// Keep old typo route as alias for backward compatibility
paymentRouter.get('/payment/varify', userauth, async (req, res) => {
    res.redirect(307, '/payment/verify');
});

// POST /payment/upi-create — submitted after user scans QR and pays via personal UPI.
// Stores UTR for manual review; premium activated by admin after verification.
paymentRouter.post('/payment/upi-create', userauth, async (req, res) => {
    try {
        const { membershipType, utrNumber } = req.body;

        if (!membershipType || !utrNumber) {
            return res.status(400).json({ success: false, message: 'membershipType and utrNumber are required' });
        }

        // UTR is 6–22 alphanumeric characters (covers UPI, IMPS, NEFT formats)
        if (!/^[A-Za-z0-9]{6,22}$/.test(utrNumber.trim())) {
            return res.status(400).json({ success: false, message: 'Invalid UTR number. Please enter the 12-digit transaction reference from your payment app.' });
        }

        const amount = membershipAmounts[membershipType];
        if (!amount) {
            return res.status(400).json({ success: false, message: 'Invalid membership type' });
        }

        // Prevent duplicate UTR submissions
        const existing = await Payment.findOne({ 'notes.utrNumber': utrNumber.trim().toUpperCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'This UTR number has already been submitted. Contact support if you think this is an error.' });
        }

        const payment = new Payment({
            userId: req.user._id,
            orderId: `UPI-${Date.now()}-${req.user._id}`,
            amount: amount * 100, // stored in paise for consistency
            currency: 'INR',
            status: 'pending_review',
            receipt: `upi_${Date.now()}`,
            paymentMethod: 'UPI',
            paymentStatus: 'Pending',
            notes: {
                membershipType,
                utrNumber: utrNumber.trim().toUpperCase(),
                paymentMode: 'direct-upi',
                upiId: 'sayakdas19072000-5@okhdfcbank',
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                emailId: req.user.emailId,
            },
        });

        await payment.save();
        console.log(`📲 UPI payment submitted — user: ${req.user.emailId}, plan: ${membershipType}, UTR: ${utrNumber.trim().toUpperCase()}`);

        return res.json({
            success: true,
            message: 'Payment submitted for review. Your premium will be activated within 24 hours after verification.',
            paymentId: payment._id,
        });
    } catch (err) {
        console.error('🔴 UPI payment submit error:', err);
        res.status(500).json({ success: false, message: 'Error submitting payment', error: err.message });
    }
});

module.exports = paymentRouter;    
