import express from "express";
import {
  buySubscription,
  getRazorPayKey,
  paymentVerification,
} from "../controllers/paymentControllers.js";

import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Buy Subscription
router.route("/subscribe").get(isAuthenticated, buySubscription);

// Verify Payment and save reference in database
router.route("/paymentVerification").post(isAuthenticated, paymentVerification);

// Get Razorpay key
router.route("/razorpaykey").get(getRazorPayKey);

export default router;
