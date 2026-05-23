const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    dateOfBirth: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    address: {
      addressLine: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      pinCode: { type: String, default: "" },
    },
    occupation: {
      type: String,
      default: "",
    },
    monthlyIncomeRange: {
      type: String,
      default: "",
    },
    walletUsagePurpose: {
      type: String,
      default: "",
    },
    governmentIdType: {
      type: String,
      default: "",
    },
    governmentIdNumber: {
      type: String,
      default: "",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    preferredLanguage: {
      type: String,
      enum: ["en", "hi", "mr"],
      default: "en",
    },
    countryCode: {
      type: String,
      default: "+91",
    },
    currency: {
      type: String,
      default: "INR",
    },
    avatarColor: {
      type: String,
      default: "#14b8a6",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
      index: true,
    },
    kycStatus: {
      type: String,
      enum: ["pending", "under_review", "verified", "rejected"],
      default: "pending",
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      default: null,
    },
    accountStatus: {
      type: String,
      enum: ["pending_onboarding", "active", "restricted"],
      default: "pending_onboarding",
    },
    verificationStatus: {
      type: String,
      enum: ["phone_verified", "kyc_verified", "rejected"],
      default: "phone_verified",
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
