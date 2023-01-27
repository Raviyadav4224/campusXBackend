import mongoose, { mongo, Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const UsersSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please enter your email"],
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    validate: validator.isStrongPassword,
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  subscription: {
    id: String,
    status: { type: String, default: "inactive" },
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  playlist: [
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
      },
      poster: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTokenExpire: String,
});
UsersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UsersSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UsersSchema.methods.getSignedToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
};

UsersSchema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordTokenExpire = Date.now() + 15 * 60 * 1000;
  console.log(
    `reset token is ${this.resetPasswordToken} & tokenexpires in ${this.resetPasswordTokenExpire}`
  );
  return resetToken;
};

export const User = mongoose.model("users", UsersSchema);
