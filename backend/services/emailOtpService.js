const crypto = require("crypto");
const nodemailer = require("nodemailer");
const AuthOtp = require("../models/AuthOtp");
const AppError = require("../utils/AppError");
const env = require("../config/env");
const { assertValidInternationalPhone } = require("../utils/phone");

const OTP_TTL_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const hashOtp = (otp, email, phoneNumber) =>
  crypto
    .createHash("sha256")
    .update(`${otp}:${normalizeEmail(email)}:${phoneNumber}:${env.jwtSecret}`)
    .digest("hex");

const createTransporter = () => {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
};

const sendOtpEmail = async ({ email, otp, purpose }) => {
  const transporter = createTransporter();
  if (!transporter) {
    throw new AppError("Email OTP service is not configured.", 500);
  }

  const subject = purpose === "signup" ? "Verify your FinLink signup" : "Your FinLink login OTP";

  await transporter.sendMail({
    from: env.smtp.from || env.smtp.user,
    to: email,
    subject,
    text: `Your FinLink OTP is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes. Do not share this code.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2>FinLink verification code</h2>
        <p>Use this OTP to ${purpose === "signup" ? "continue signup" : "sign in"}:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${otp}</p>
        <p>This code expires in ${OTP_TTL_MINUTES} minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
};

const createEmailOtp = async ({ email, phoneNumber, purpose = "login" }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = assertValidInternationalPhone(phoneNumber);
  const otp = String(crypto.randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await AuthOtp.updateMany(
    {
      email: normalizedEmail,
      phoneNumber: normalizedPhone,
      consumedAt: null,
    },
    { consumedAt: new Date() }
  );

  await AuthOtp.create({
    email: normalizedEmail,
    phoneNumber: normalizedPhone,
    otpHash: hashOtp(otp, normalizedEmail, normalizedPhone),
    purpose,
    expiresAt,
  });

  await sendOtpEmail({ email: normalizedEmail, otp, purpose });

  return {
    email: normalizedEmail,
    phoneNumber: normalizedPhone,
    expiresAt,
    expiresInMinutes: OTP_TTL_MINUTES,
  };
};

const verifyEmailOtp = async ({ email, phoneNumber, otp }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = assertValidInternationalPhone(phoneNumber);

  const otpRecord = await AuthOtp.findOne({
    email: normalizedEmail,
    phoneNumber: normalizedPhone,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new AppError("OTP is invalid or expired. Please request a new code.", 401);
  }

  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    otpRecord.consumedAt = new Date();
    await otpRecord.save();
    throw new AppError("Too many OTP attempts. Please request a new code.", 429);
  }

  const candidateHash = hashOtp(String(otp || ""), normalizedEmail, normalizedPhone);
  const expected = Buffer.from(otpRecord.otpHash, "hex");
  const candidate = Buffer.from(candidateHash, "hex");
  const matches = expected.length === candidate.length && crypto.timingSafeEqual(expected, candidate);

  if (!matches) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new AppError("OTP is incorrect.", 401);
  }

  otpRecord.consumedAt = new Date();
  await otpRecord.save();

  return {
    email: normalizedEmail,
    phoneNumber: normalizedPhone,
    purpose: otpRecord.purpose,
  };
};

module.exports = {
  createEmailOtp,
  normalizeEmail,
  verifyEmailOtp,
};
