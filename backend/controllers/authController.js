const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const {
  buildOnboardingPayload,
  createOrResumeOnboardingSession,
  findUserWalletByPhone,
  syncUserRoleFromConfig,
  isAdminPhoneNumber,
} = require("../services/userLifecycleService");
const { createAuthLog } = require("../services/authLogService");
const { createEmailOtp, normalizeEmail, verifyEmailOtp } = require("../services/emailOtpService");
const {
  buildAuthTokens,
  buildOnboardingToken,
  verifyToken,
} = require("../services/tokenService");

const toAuthPayload = async (user, wallet, tokens = null) => {
  const unreadNotifications = await Notification.countDocuments({
    user: user._id,
    read: false,
  });

  const payload = {
    user: {
      id: user._id,
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
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

  if (tokens) {
    payload.tokens = tokens;
  }

  return payload;
};

const requestEmailOtp = asyncHandler(async (req, res) => {
  const { email, phoneNumber } = req.body;
  const existingAccount = await findUserWalletByPhone(phoneNumber);
  const purpose = existingAccount ? "login" : "signup";

  const otpSession = await createEmailOtp({
    email,
    phoneNumber,
    purpose,
  });

  await createAuthLog({
    user: existingAccount?.user || null,
    phoneNumber: otpSession.phoneNumber,
    eventType: "otp_sent",
    status: "info",
    req,
    metadata: {
      email: otpSession.email,
      purpose,
    },
  });

  res.json({
    success: true,
    message: `OTP sent to ${otpSession.email}.`,
    data: {
      email: otpSession.email,
      phoneNumber: otpSession.phoneNumber,
      purpose,
      expiresAt: otpSession.expiresAt,
      expiresInMinutes: otpSession.expiresInMinutes,
    },
  });
});

const loginWithEmailOtp = asyncHandler(async (req, res) => {
  const { email, phoneNumber, otp, preferredLanguage } = req.body;
  const verifiedOtp = await verifyEmailOtp({ email, phoneNumber, otp });
  const normalizedEmail = normalizeEmail(verifiedOtp.email);

  const existingAccount = await findUserWalletByPhone(verifiedOtp.phoneNumber);

  if (existingAccount) {
    const { user, wallet } = existingAccount;
    if (user.email && user.email !== normalizedEmail) {
      await createAuthLog({
        user,
        phoneNumber: verifiedOtp.phoneNumber,
        eventType: "login_failure",
        status: "failure",
        req,
        metadata: { reason: "email_phone_mismatch", email: normalizedEmail },
      });
      throw new AppError("This phone number is linked to a different email address.", 409);
    }

    user.email = normalizedEmail;
    user.emailVerified = true;
    user.emailVerifiedAt = user.emailVerifiedAt || new Date();
    user.lastLoginAt = new Date();
    await syncUserRoleFromConfig(user);
    await user.save();

    const tokens = buildAuthTokens(user);
    await createAuthLog({
      user,
      phoneNumber: verifiedOtp.phoneNumber,
      eventType: "otp_verified",
      status: "success",
      req,
      metadata: { sessionState: "authenticated", email: normalizedEmail },
    });
    await createAuthLog({
      user,
      phoneNumber: verifiedOtp.phoneNumber,
      eventType: "login_success",
      status: "success",
      req,
      metadata: { sessionState: "authenticated", role: user.role || "USER" },
    });
    res.json({
      success: true,
      message: "Signed in successfully.",
      sessionState: "authenticated",
      data: await toAuthPayload(user, wallet, tokens),
    });
    return;
  }

  const dbSession = await mongoose.startSession();
  let onboardingSession;

  try {
    await dbSession.withTransaction(async () => {
      onboardingSession = await createOrResumeOnboardingSession(
        {
          phoneNumber: verifiedOtp.phoneNumber,
          email: normalizedEmail,
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
    phoneNumber: verifiedOtp.phoneNumber,
    eventType: "otp_verified",
    status: "success",
    req,
    metadata: {
      sessionState: "onboarding",
      email: normalizedEmail,
      role: isAdminPhoneNumber(verifiedOtp.phoneNumber) ? "ADMIN" : "USER",
    },
  });

  res.json({
    success: true,
    message: "Email verified. Complete onboarding to activate your wallet.",
    sessionState: "onboarding",
    data: {
      ...buildOnboardingPayload(onboardingSession),
      tokens: {
        onboardingToken: buildOnboardingToken(onboardingSession),
      },
    },
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError("Refresh token is required.", 401);
  }

  const payload = verifyToken(refreshToken, "refresh");
  const existingAccount = await findUserWalletByPhone(payload.phoneNumber);

  if (!existingAccount) {
    throw new AppError("User session not found. Please sign in again.", 401);
  }

  const tokens = buildAuthTokens(existingAccount.user);
  res.json({
    success: true,
    data: tokens,
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
  loginWithEmailOtp,
  refreshAccessToken,
  requestEmailOtp,
  getSession,
  getAuthStatus,
};
