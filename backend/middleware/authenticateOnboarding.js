const AppError = require("../utils/AppError");
const { getActiveOnboardingSession } = require("../services/userLifecycleService");
const { getBearerToken, verifyToken } = require("../services/tokenService");

const authenticateOnboarding = async (req, res, next) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return next(new AppError("Onboarding session is required.", 401));
    }

    const payload = verifyToken(token, "onboarding");
    const onboardingSession = await getActiveOnboardingSession(payload.phoneNumber);

    if (!onboardingSession) {
      return next(new AppError("Onboarding session not found. Please sign in again.", 401));
    }

    if (payload.email && onboardingSession.email !== payload.email) {
      return next(new AppError("Onboarding token does not match this email.", 401));
    }

    req.onboardingSession = onboardingSession;
    req.authToken = payload;
    return next();
  } catch (error) {
    return next(error.statusCode ? error : new AppError(error.message || "Unable to authenticate onboarding session.", 401));
  }
};

module.exports = authenticateOnboarding;
