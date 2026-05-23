const mongoose = require("mongoose");

const onboardingSessionSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firebaseUid: {
      type: String,
      default: "",
    },
    sessionStatus: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
    },
    currentStep: {
      type: String,
      enum: ["basic", "address", "financial", "kyc", "language", "review", "completed"],
      default: "basic",
    },
    phoneVerified: {
      type: Boolean,
      default: true,
    },
    otpMode: {
      type: String,
      enum: ["firebase", "simulated"],
      default: "simulated",
    },
    fullName: String,
    email: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    dateOfBirth: String,
    gender: String,
    addressLine: String,
    city: String,
    state: String,
    country: String,
    pinCode: String,
    occupation: String,
    monthlyIncomeRange: String,
    walletUsagePurpose: String,
    governmentIdType: String,
    governmentIdNumber: String,
    profilePhoto: String,
    preferredLanguage: {
      type: String,
      enum: ["en", "hi", "mr"],
      default: "en",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OnboardingSession", onboardingSessionSchema);
