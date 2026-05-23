const User = require("../models/User");
const Wallet = require("../models/Wallet");
const OnboardingSession = require("../models/OnboardingSession");
const env = require("../config/env");
const { createWalletNumber, pickAvatarColor } = require("../utils/wallet");
const { assertValidInternationalPhone, normalizePhoneNumber, phoneToSyntheticUid } = require("../utils/phone");
const { createNotification } = require("./notificationService");

const applySession = (query, session) => (session ? query.session(session) : query);

const ensureUniqueWalletNumber = async (session = null) => {
  let walletNumber = createWalletNumber();
  let existingWallet = await applySession(Wallet.findOne({ walletNumber }), session);

  while (existingWallet) {
    walletNumber = createWalletNumber();
    existingWallet = await applySession(Wallet.findOne({ walletNumber }), session);
  }

  return walletNumber;
};

const findUserWalletByPhone = async (phoneNumber, session = null) => {
  const normalizedPhoneNumber = assertValidInternationalPhone(phoneNumber);
  const user = await applySession(User.findOne({ phoneNumber: normalizedPhoneNumber }), session);
  if (!user) {
    return null;
  }

  const wallet = await applySession(Wallet.findOne({ user: user._id }), session);
  if (!wallet) {
    return null;
  }

  return { user, wallet };
};

const getActiveOnboardingSession = async (phoneNumber, session = null) => {
  const normalizedPhoneNumber = assertValidInternationalPhone(phoneNumber);
  return applySession(
    OnboardingSession.findOne({ phoneNumber: normalizedPhoneNumber, sessionStatus: "active" }),
    session
  );
};

const createOrResumeOnboardingSession = async ({ phoneNumber, preferredLanguage = "en" }, session = null) => {
  const normalizedPhoneNumber = assertValidInternationalPhone(phoneNumber);
  let onboardingSession = await getActiveOnboardingSession(normalizedPhoneNumber, session);

  if (!onboardingSession) {
    const [createdSession] = await OnboardingSession.create(
      [
        {
          phoneNumber: normalizedPhoneNumber,
          firebaseUid: phoneToSyntheticUid(normalizedPhoneNumber),
          preferredLanguage,
          phoneVerified: true,
          otpMode: "simulated",
          currentStep: "basic",
          sessionStatus: "active",
        },
      ],
      session ? { session } : undefined
    );
    onboardingSession = createdSession;
  } else {
    onboardingSession.preferredLanguage = preferredLanguage || onboardingSession.preferredLanguage;
    await onboardingSession.save(session ? { session } : undefined);
  }

  return onboardingSession;
};

const buildOnboardingPayload = (onboardingSession) => ({
  phoneNumber: onboardingSession.phoneNumber,
  fullName: onboardingSession.fullName || "",
  email: onboardingSession.email || "",
  dateOfBirth: onboardingSession.dateOfBirth || "",
  gender: onboardingSession.gender || "",
  addressLine: onboardingSession.addressLine || "",
  city: onboardingSession.city || "",
  state: onboardingSession.state || "",
  country: onboardingSession.country || "",
  pinCode: onboardingSession.pinCode || "",
  occupation: onboardingSession.occupation || "",
  monthlyIncomeRange: onboardingSession.monthlyIncomeRange || "",
  walletUsagePurpose: onboardingSession.walletUsagePurpose || "",
  governmentIdType: onboardingSession.governmentIdType || "",
  governmentIdNumber: onboardingSession.governmentIdNumber || "",
  profilePhoto: onboardingSession.profilePhoto || "",
  preferredLanguage: onboardingSession.preferredLanguage || "en",
  currentStep: onboardingSession.currentStep,
  otpMode: onboardingSession.otpMode,
});

const isAdminPhoneNumber = (phoneNumber) => env.adminPhones.includes(normalizePhoneNumber(phoneNumber));

const resolveUserRole = (phoneNumber) => (isAdminPhoneNumber(phoneNumber) ? "ADMIN" : "USER");

const syncUserRoleFromConfig = async (user, session = null) => {
  if (!user) {
    return user;
  }

  const nextRole = resolveUserRole(user.phoneNumber);

  if (user.role !== nextRole) {
    user.role = nextRole;
    await user.save(session ? { session } : undefined);
  }

  return user;
};

const buildRecipientPreview = ({ user, wallet }) => ({
  id: user._id,
  fullName: user.fullName,
  phoneNumber: normalizePhoneNumber(user.phoneNumber),
  walletNumber: wallet.walletNumber,
  initials: user.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join(""),
  avatarColor: user.avatarColor,
  verificationStatus: user.kycStatus === "verified" ? "verified" : "registered",
});

const createUserAndWalletFromOnboarding = async (onboardingSession, session = null) => {
  const normalizedPhoneNumber = assertValidInternationalPhone(onboardingSession.phoneNumber);
  const existingUser = await applySession(User.findOne({ phoneNumber: normalizedPhoneNumber }), session);

  if (existingUser) {
    await syncUserRoleFromConfig(existingUser, session);
    const existingWallet = await applySession(Wallet.findOne({ user: existingUser._id }), session);
    return { user: existingUser, wallet: existingWallet };
  }

  const [createdUser] = await User.create(
    [
      {
        firebaseUid: onboardingSession.firebaseUid || phoneToSyntheticUid(normalizedPhoneNumber),
        fullName: onboardingSession.fullName,
        phoneNumber: normalizedPhoneNumber,
        email: onboardingSession.email || "",
        dateOfBirth: onboardingSession.dateOfBirth || "",
        gender: onboardingSession.gender || "",
        address: {
          addressLine: onboardingSession.addressLine || "",
          city: onboardingSession.city || "",
          state: onboardingSession.state || "",
          country: onboardingSession.country || "",
          pinCode: onboardingSession.pinCode || "",
        },
        occupation: onboardingSession.occupation || "",
        monthlyIncomeRange: onboardingSession.monthlyIncomeRange || "",
        walletUsagePurpose: onboardingSession.walletUsagePurpose || "",
        governmentIdType: onboardingSession.governmentIdType || "",
        governmentIdNumber: onboardingSession.governmentIdNumber || "",
        profilePhoto: onboardingSession.profilePhoto || "",
        preferredLanguage: onboardingSession.preferredLanguage || "en",
        countryCode: normalizedPhoneNumber.match(/^\+\d{1,3}/)?.[0] || "+91",
        currency: "INR",
        avatarColor: pickAvatarColor(normalizedPhoneNumber),
        role: resolveUserRole(normalizedPhoneNumber),
        kycStatus: "verified",
        onboardingComplete: true,
        accountStatus: "active",
        verificationStatus: "kyc_verified",
        lastLoginAt: new Date(),
      },
    ],
    session ? { session } : undefined
  );

  const walletNumber = await ensureUniqueWalletNumber(session);
  const [createdWallet] = await Wallet.create(
    [
      {
        user: createdUser._id,
        walletNumber,
        balance: 12000,
        currency: createdUser.currency,
        isActive: true,
      },
    ],
    session ? { session } : undefined
  );

  createdUser.walletId = createdWallet._id;
  await createdUser.save(session ? { session } : undefined);

  await createNotification(
    {
      user: createdUser._id,
      title: "Wallet activated",
      message: "Your KYC onboarding is complete and your wallet is now active.",
      type: "welcome",
      metadata: { walletNumber: createdWallet.walletNumber },
    },
    session
  );

  onboardingSession.sessionStatus = "completed";
  onboardingSession.currentStep = "completed";
  await onboardingSession.save(session ? { session } : undefined);

  return { user: createdUser, wallet: createdWallet };
};

module.exports = {
  buildOnboardingPayload,
  buildRecipientPreview,
  createOrResumeOnboardingSession,
  createUserAndWalletFromOnboarding,
  findUserWalletByPhone,
  getActiveOnboardingSession,
  resolveUserRole,
  syncUserRoleFromConfig,
  isAdminPhoneNumber,
};
