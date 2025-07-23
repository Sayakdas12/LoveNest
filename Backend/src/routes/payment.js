const express = require('express');
const { userauth } = require('../middlewares/auth');
const razorpayInstance = require('../utils/razorPay');
const payment = require('../models/payment'); 

const paymentRouter = express.Router();

// Create Razorpay payment order
paymentRouter.post('/payment/create', userauth, async (req, res) => {
  try {
    const order = await razorpayInstance.orders.create({
      amount: 70000,
      currency: 'INR',
      receipt: 'receipt#1',
      notes: {
        firstName: 'value3',
        lastName: 'value2',
        membershipType: 'premium',
      },
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('Razorpay error:', err); // Show full error
    res.status(401).json({ success: false, message: 'Error processing payment', error: err.message });
  }
});


module.exports = paymentRouter;
