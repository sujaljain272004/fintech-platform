const express = require("express");
const authenticate = require("../middleware/authenticate");
const validate = require("../middleware/validate");
const {
  getWallet,
  getRecipientPreview,
  getDashboard,
  transferMoney,
  transferValidators,
} = require("../controllers/walletController");

const router = express.Router();

router.use(authenticate);
router.get("/", getWallet);
router.get("/dashboard", getDashboard);
router.get("/recipient", getRecipientPreview);
router.post("/transfer", transferValidators, validate, transferMoney);

module.exports = router;
