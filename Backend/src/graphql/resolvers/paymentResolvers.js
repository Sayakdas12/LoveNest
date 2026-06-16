const Payment = require("../../models/payment");
const razorpayInstance = require("../../utils/razorPay");
const { membershipAmounts } = require("../../utils/constants");

const paymentResolvers = {
  Mutation: {
    createPaymentOrder: async (_, { membershipType }, context) => {
      context.requireAuth();

      if (!membershipAmounts[membershipType]) {
        const err = new Error("Invalid membership type: " + membershipType);
        err.extensions = { code: "BAD_USER_INPUT" };
        throw err;
      }

      const { firstName, lastName, emailId } = context.user;

      const order = await razorpayInstance().orders.create({
        amount: membershipAmounts[membershipType] * 100,
        currency: "INR",
        receipt: "receipt#1",
        notes: { firstName, lastName, emailId, membershipType },
      });

      await new Payment({
        userId: context.user._id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status || "active",
        receipt: order.receipt,
        notes: order.notes,
        paymentMethod: "UPI",
        paymentStatus: "Pending",
      }).save();

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    },
  },
};

module.exports = paymentResolvers;
