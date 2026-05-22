const express = require("express");
const { body } = require("express-validator");
const authenticateOnboarding = require("../middleware/authenticateOnboarding");
const validate = require("../middleware/validate");
const {
  completeOnboarding,
  getOnboardingSession,
  saveAddressInfo,
  saveBasicInfo,
  saveFinancialInfo,
  saveKycInfo,
  saveLanguagePreference,
} = require("../controllers/onboardingController");

const router = express.Router();

router.use(authenticateOnboarding);
router.get("/session", getOnboardingSession);

router.put(
  "/basic-info",
  [
    body("fullName").trim().isLength({ min: 2, max: 60 }).withMessage("Full name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("dateOfBirth").trim().notEmpty().withMessage("Date of birth is required."),
    body("gender").trim().notEmpty().withMessage("Gender is required."),
  ],
  validate,
  saveBasicInfo
);

router.put(
  "/address",
  [
    body("addressLine").trim().notEmpty().withMessage("Address is required."),
    body("city").trim().notEmpty().withMessage("City is required."),
    body("state").trim().notEmpty().withMessage("State is required."),
    body("country").trim().notEmpty().withMessage("Country is required."),
    body("pinCode").trim().notEmpty().withMessage("PIN code is required."),
  ],
  validate,
  saveAddressInfo
);

router.put(
  "/financial",
  [
    body("occupation").trim().notEmpty().withMessage("Occupation is required."),
    body("monthlyIncomeRange").trim().notEmpty().withMessage("Income range is required."),
    body("walletUsagePurpose").trim().notEmpty().withMessage("Purpose of wallet usage is required."),
  ],
  validate,
  saveFinancialInfo
);

router.put(
  "/kyc",
  [
    body("governmentIdType").trim().notEmpty().withMessage("Government ID type is required."),
    body("governmentIdNumber").trim().notEmpty().withMessage("Government ID number is required."),
    body("profilePhoto").optional().trim(),
  ],
  validate,
  saveKycInfo
);

router.put(
  "/language",
  [body("preferredLanguage").isIn(["en", "hi", "mr"]).withMessage("Language is required.")],
  validate,
  saveLanguagePreference
);

router.post("/complete", completeOnboarding);

module.exports = router;
