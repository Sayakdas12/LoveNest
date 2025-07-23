const Razorpay = require('razorpay');
require('dotenv').config(); // ✅ Must be at top or before accessing env vars

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = instance;
