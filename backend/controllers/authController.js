const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const env = require("../config/env");
const {
  buildOnboardingPayload,
  createOrResumeOnboardingSession,
  findUserWalletByPhone,
  syncUserRoleFromConfig,
  isAdminPhoneNumber,
} = require("../services/userLifecycleService");
const { createAuthLog } = require("../services/authLogService");

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
      role: user.role || "USER",
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
    await syncUserRoleFromConfig(user);
    await createAuthLog({
      user,
      phoneNumber,
      eventType: "login_success",
      status: "success",
      req,
      metadata: { sessionState: "authenticated", role: user.role || "USER" },
    });
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

  await createAuthLog({
    phoneNumber,
    eventType: "login_success",
    status: "info",
    req,
    metadata: { sessionState: "onboarding", role: isAdminPhoneNumber(phoneNumber) ? "ADMIN" : "USER" },
  });

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

  await syncUserRoleFromConfig(req.appUser);

  await createAuthLog({
    user: req.appUser,
    phoneNumber: req.appUser.phoneNumber,
    eventType: "session_restore",
    status: "info",
    req,
    metadata: { role: req.appUser.role || "USER" },
  });

  res.json({
    success: true,
    data: await toAuthPayload(req.appUser, req.appWallet),
  });
});

const getAuthStatus = asyncHandler(async (req, res) => {
  if (req.appUser && req.appWallet) {
    await syncUserRoleFromConfig(req.appUser);
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
