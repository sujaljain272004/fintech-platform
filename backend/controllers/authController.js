const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const {
  buildOnboardingPayload,
  createOrResumeOnboardingSession,
  findUserWalletByPhone,
} = require("../services/userLifecycleService");

const toAuthPayload = async (user, wallet) => {
  const unreadNotifications = await Notification.countDocuments({
    user: user._id,
    read: false,
  });

  return {
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
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
};

const loginWithPhone = asyncHandler(async (req, res) => {
  const { phoneNumber, preferredLanguage } = req.body;

  const existingAccount = await findUserWalletByPhone(phoneNumber);

  if (existingAccount) {
    const { user, wallet } = existingAccount;
    res.json({
      success: true,
      message: "Signed in successfully.",
      sessionState: "authenticated",
      data: await toAuthPayload(user, wallet),
    });
    return;
  }

  const dbSession = await mongoose.startSession();
  let onboardingSession;

  try {
    await dbSession.withTransaction(async () => {
      onboardingSession = await createOrResumeOnboardingSession(
        {
          phoneNumber,
          preferredLanguage,
        },
        dbSession
      );
    });
  } catch (error) {
    if (error.code === "INVALID_PHONE") {
      throw new AppError(error.message, 422);
    }
    throw error;
  } finally {
    await dbSession.endSession();
  }

  res.json({
    success: true,
    message: "Phone verified. Complete onboarding to activate your wallet.",
    sessionState: "onboarding",
    data: buildOnboardingPayload(onboardingSession),
  });
});

const getSession = asyncHandler(async (req, res) => {
  if (!req.appUser || !req.appWallet) {
    throw new AppError("No synced FinLink profile found for this account yet.", 404);
  }

  res.json({
    success: true,
    data: await toAuthPayload(req.appUser, req.appWallet),
  });
});

const getAuthStatus = asyncHandler(async (req, res) => {
  if (req.appUser && req.appWallet) {
    res.json({
      success: true,
      sessionState: "authenticated",
      data: await toAuthPayload(req.appUser, req.appWallet),
    });
    return;
  }

  if (req.onboardingSession) {
    res.json({
      success: true,
      sessionState: "onboarding",
      data: buildOnboardingPayload(req.onboardingSession),
    });
    return;
  }

  throw new AppError("No active auth session found.", 404);
});

module.exports = {
  loginWithPhone,
  getSession,
  getAuthStatus,
};
