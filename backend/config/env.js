const path = require("path");
const dotenv = require("dotenv");
const { normalizePhoneNumber } = require("../utils/phone");

dotenv.config({ path: path.join(__dirname, "..", ".env"), override: true });

const parseOrigins = (value) =>
  String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const frontendUrls = parseOrigins(process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "http://localhost:5173");
const adminPhones = parseOrigins(process.env.ADMIN_PHONE_NUMBERS || process.env.ADMIN_PHONE_NUMBER || "").map(
  normalizePhoneNumber
);

module.exports = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: frontendUrls[0] || "http://localhost:5173",
  frontendUrls,
  adminPhones,
  mongoUri: process.env.MONGODB_URI,
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  groqBaseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
  jwtSecret: process.env.JWT_SECRET || "finlink-dev-secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  jwtOnboardingExpiresIn: process.env.JWT_ONBOARDING_EXPIRES_IN || "45m",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || "",
  },
};
