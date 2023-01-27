import { User } from "../models/users.js";
import errorResponse from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
export const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token === undefined) {
    return next(
      new errorResponse(
        "You are not authorize to access this, Please login first",
        401
      )
    );
  }
  const { _id } = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(_id);
  next();
};

export const authorizeRole = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new errorResponse(`Only admin can access this`));
  }
  next();
};

export const authorizeSubscribers = async (req, res, next) => {
  if (req.user.role !== "admin" && req.user.subscription.status !== "active") {
    return next(new errorResponse(`Only subscribers can access this`));
  }
  next();
};
