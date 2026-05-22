const express = require("express");
const authenticate = require("../middleware/authenticate");
const {
  getTransactions,
  verifyTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

router.use(authenticate);
router.get("/", getTransactions);
router.get("/:id/verify", verifyTransaction);

module.exports = router;
