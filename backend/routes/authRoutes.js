const express = require("express");
const { body } = require("express-validator");
const authenticate = require("../middleware/authenticate");
const authenticateOnboarding = require("../middleware/authenticateOnboarding");
const validate = require("../middleware/validate");
const { loginWithPhone, getSession, getAuthStatus } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/login",
  [
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
  loginWithPhone
);

router.get("/session", authenticate, getSession);
router.get("/status", (req, res, next) => {
  const phoneNumber = req.headers["x-user-phone"];
  if (!phoneNumber) {
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
