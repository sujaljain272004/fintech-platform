const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const {
  buildOnboardingPayload,
  createUserAndWalletFromOnboarding,
} = require("../services/userLifecycleService");
const Notification = require("../models/Notification");
const { buildAuthTokens } = require("../services/tokenService");

const toAuthPayload = async (user, wallet, tokens = null) => {
  const unreadNotifications = await Notification.countDocuments({
    user: user._id,
    read: false,
  });

  const payload = {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
      phoneNumber: user.phoneNumber,
      preferredLanguage: user.preferredLanguage,
      currency: user.currency,
      avatarColor: user.avatarColor,
      kycStatus: user.kycStatus,
      onboardingComplete: user.onboardingComplete,
      accountStatus: user.accountStatus,
      verificationStatus: user.verificationStatus,
    },
    wallet: {
      id: wallet._id,
      walletNumber: wallet.walletNumber,
      balance: wallet.balance,
      currency: wallet.currency,
      isActive: wallet.isActive,
    },
    unreadNotifications,
  };

  if (tokens) {
    payload.tokens = tokens;
  }

  return payload;
};

const getOnboardingSession = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: buildOnboardingPayload(req.onboardingSession),
  });
});

const saveBasicInfo = asyncHandler(async (req, res) => {
  const { fullName, email, dateOfBirth, gender } = req.body;
  if (req.onboardingSession.email && email !== req.onboardingSession.email) {
    throw new AppError("Use the verified email address for onboarding.", 422);
  }
  req.onboardingSession.fullName = fullName;
  req.onboardingSession.email = req.onboardingSession.email || email;
  req.onboardingSession.dateOfBirth = dateOfBirth;
  req.onboardingSession.gender = gender;
  req.onboardingSession.currentStep = "address";
  await req.onboardingSession.save();

  res.json({ success: true, data: buildOnboardingPayload(req.onboardingSession) });
});

const saveAddressInfo = asyncHandler(async (req, res) => {
  const { addressLine, city, state, country, pinCode } = req.body;
  Object.assign(req.onboardingSession, {
    addressLine,
    city,
    state,
    country,
    pinCode,
    currentStep: "financial",
  });
  await req.onboardingSession.save();

  res.json({ success: true, data: buildOnboardingPayload(req.onboardingSession) });
});

const saveFinancialInfo = asyncHandler(async (req, res) => {
  const { occupation, monthlyIncomeRange, walletUsagePurpose } = req.body;
  Object.assign(req.onboardingSession, {
    occupation,
    monthlyIncomeRange,
    walletUsagePurpose,
    currentStep: "kyc",
  });
  await req.onboardingSession.save();

  res.json({ success: true, data: buildOnboardingPayload(req.onboardingSession) });
});

const saveKycInfo = asyncHandler(async (req, res) => {
  const { governmentIdType, governmentIdNumber, profilePhoto } = req.body;
  Object.assign(req.onboardingSession, {
    governmentIdType,
    governmentIdNumber,
    profilePhoto: profilePhoto || "",
    currentStep: "language",
  });
  await req.onboardingSession.save();

  res.json({ success: true, data: buildOnboardingPayload(req.onboardingSession) });
});

const saveLanguagePreference = asyncHandler(async (req, res) => {
  req.onboardingSession.preferredLanguage = req.body.preferredLanguage;
  req.onboardingSession.currentStep = "review";
  await req.onboardingSession.save();

  res.json({ success: true, data: buildOnboardingPayload(req.onboardingSession) });
});

const completeOnboarding = asyncHandler(async (req, res) => {
  const requiredFields = [
    "fullName",
    "email",
    "dateOfBirth",
    "gender",
    "addressLine",
    "city",
    "state",
    "country",
    "pinCode",
    "occupation",
    "monthlyIncomeRange",
    "walletUsagePurpose",
    "governmentIdType",
    "governmentIdNumber",
    "preferredLanguage",
  ];

  const missingField = requiredFields.find((field) => !req.onboardingSession[field]);
  if (missingField) {
    throw new AppError("Please complete all onboarding and KYC fields before continuing.", 422);
  }

  const dbSession = await mongoose.startSession();
  let user;
  let wallet;

  try {
    await dbSession.withTransaction(async () => {
      const result = await createUserAndWalletFromOnboarding(req.onboardingSession, dbSession);
      user = result.user;
      wallet = result.wallet;
    });
  } finally {
    await dbSession.endSession();
  }

  res.status(201).json({
    success: true,
    sessionState: "authenticated",
    data: await toAuthPayload(user, wallet, buildAuthTokens(user)),
  });
});

module.exports = {
  completeOnboarding,
  getOnboardingSession,
  saveAddressInfo,
  saveBasicInfo,
  saveFinancialInfo,
  saveKycInfo,
  saveLanguagePreference,
};
