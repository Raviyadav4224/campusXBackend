import { User } from "../models/users.js";
import { Payment } from "../models/payment.js";
import { instance } from "../server.js";
import errorResponse from "../utils/errorHandler.js";
import crypto from "crypto";
export const buySubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.role === "admin")
      return next(new errorResponse("Admin can't buy subscription", 400));

    const plan_id = process.env.PLAN_ID || "plan_LQKkPNvDnBgL4a";
    const subscription = await instance.subscriptions.create({
      plan_id,
      customer_notify: 1,
      total_count: 12,
    });

    user.subscription.id = subscription.id;

    user.subscription.status = subscription.status;

    await user.save();
    res.status(201).json({
      success: true,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    next(error);
  }
};

export const paymentVerification = async (req, res, next) => {
  try {
    const {
      razorpay_signature,
      razorpay_payment_id,
      razorpay_subscription_id,
    } = req.body;
    console.log(
      "reqBody",
      razorpay_signature,
      razorpay_payment_id,
      razorpay_subscription_id
    );
    const user = await User.findById(req.user._id);

    const subscription_id = user.subscription.id;
    console.log("subscription_id", subscription_id);
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
      .digest("hex");
    console.log("generated_signature", generated_signature);
    const isAuthentic = generated_signature === razorpay_signature;
    console.log("isAuthentic", isAuthentic);
    if (!isAuthentic)
      return res.redirect(`${process.env.FRONTEND_URL}/paymentFail`);
    console.log("isAuthentic", isAuthentic);

    // database comes here
    await Payment.create({
      razorpay_signature,
      razorpay_payment_id,
      razorpay_subscription_id,
    });

    user.subscription.status = "active";

    await user.save();

    res.redirect(
      `${process.env.FRONTEND_URL}/paymentSuccess?reference=${razorpay_payment_id}`
    );
  } catch (error) {
    next(error);
  }
};

export const getRazorPayKey = async (req, res, next) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_API_ID,
  });
};
