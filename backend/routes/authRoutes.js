const express = require("express");
const { body } = require("express-validator");
const authenticate = require("../middleware/authenticate");
const authenticateOnboarding = require("../middleware/authenticateOnboarding");
const validate = require("../middleware/validate");
const {
  getSession,
  getAuthStatus,
  loginWithEmailOtp,
  refreshAccessToken,
  requestEmailOtp,
} = require("../controllers/authController");

const router = express.Router();

router.post(
  "/request-otp",
  [
    body("email").trim().isEmail().withMessage("A valid email is required."),
    body("phoneNumber")
      .trim()
      .matches(/^\+[1-9]\d{7,14}$/)
      .withMessage("Phone number must use international format like +919876543210."),
    body("fullName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 60 })
      .withMessage("Full name must be between 2 and 60 characters."),
    body("preferredLanguage")
      .optional()
      .isIn(["en", "hi", "mr"])
      .withMessage("Preferred language must be en, hi, or mr."),
  ],
  validate,
  requestEmailOtp
);

router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("A valid email is required."),
    body("phoneNumber")
      .trim()
      .matches(/^\+[1-9]\d{7,14}$/)
      .withMessage("Phone number must use international format like +919876543210."),
    body("otp")
      .trim()
      .matches(/^\d{6}$/)
      .withMessage("OTP must be a 6 digit code."),
    body("preferredLanguage")
      .optional()
      .isIn(["en", "hi", "mr"])
      .withMessage("Preferred language must be en, hi, or mr."),
  ],
  validate,
  loginWithEmailOtp
);

router.post("/refresh", [body("refreshToken").trim().notEmpty().withMessage("Refresh token is required.")], validate, refreshAccessToken);
router.get("/session", authenticate, getSession);
router.get("/status", (req, res, next) => {
  const hasBearerToken = Boolean(req.headers.authorization);
  if (!hasBearerToken) {
    return res.status(401).json({ success: false, message: "Session not found." });
  }
  return authenticate(req, res, (authError) => {
    if (!authError) {
      return getAuthStatus(req, res, next);
    }
    return authenticateOnboarding(req, res, (onboardingError) => {
      if (!onboardingError) {
        return getAuthStatus(req, res, next);
      }
      return next(authError);
    });
  });
});

module.exports = router;
