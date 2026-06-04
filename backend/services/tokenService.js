const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../utils/AppError");

const signToken = (payload, expiresIn) =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn,
    issuer: "finlink-api",
    audience: "finlink-client",
  });

const buildAuthTokens = (user) => ({
  accessToken: signToken(
    {
      type: "access",
      sub: String(user._id),
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role || "USER",
    },
    env.jwtAccessExpiresIn
  ),
  refreshToken: signToken(
    {
      type: "refresh",
      sub: String(user._id),
      phoneNumber: user.phoneNumber,
      email: user.email,
    },
    env.jwtRefreshExpiresIn
  ),
});

const buildOnboardingToken = (onboardingSession) =>
  signToken(
    {
      type: "onboarding",
      phoneNumber: onboardingSession.phoneNumber,
      email: onboardingSession.email,
    },
    env.jwtOnboardingExpiresIn
  );

const verifyToken = (token, expectedType) => {
  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      issuer: "finlink-api",
      audience: "finlink-client",
    });

    if (expectedType && payload.type !== expectedType) {
      throw new AppError("Invalid token type.", 401);
    }

    return payload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Invalid or expired authentication token.", 401);
  }
};

const getBearerToken = (req) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return "";
  }

  return token;
};

module.exports = {
  buildAuthTokens,
  buildOnboardingToken,
  getBearerToken,
  verifyToken,
};
