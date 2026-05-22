const AppError = require("../utils/AppError");
const { getActiveOnboardingSession } = require("../services/userLifecycleService");
const { normalizePhoneNumber } = require("../utils/phone");

const authenticateOnboarding = async (req, res, next) => {
  try {
    const phoneNumber = normalizePhoneNumber(req.headers["x-user-phone"] || "");

    if (!phoneNumber) {
      return next(new AppError("Onboarding session is required.", 401));
    }

    const onboardingSession = await getActiveOnboardingSession(phoneNumber);

    if (!onboardingSession) {
      return next(new AppError("Onboarding session not found. Please sign in again.", 401));
    }

    req.onboardingSession = onboardingSession;
    return next();
  } catch (error) {
    return next(new AppError(error.message || "Unable to authenticate onboarding session.", 401));
  }
};

module.exports = authenticateOnboarding;
