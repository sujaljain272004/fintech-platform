const path = require("path");
const dotenv = require("dotenv");
const { normalizePhoneNumber } = require("../utils/phone");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

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
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  jwtSecret: process.env.JWT_SECRET || "finlink-dev-secret",
};
