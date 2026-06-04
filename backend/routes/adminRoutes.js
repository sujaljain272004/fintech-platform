const express = require("express");
const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.use(authenticate, requireRole(["ADMIN"]));

router.get("/dashboard", adminController.dashboard);
router.get("/users", adminController.listUsers);
router.patch("/users/:id/status", adminController.updateUserStatus);
router.patch("/users/:id/kyc", adminController.approveUserKyc);
router.get("/transactions", adminController.listTransactions);
router.post("/transactions/:id/reverse", adminController.reverseTransaction);
router.get("/auth-logs", adminController.listAuthLogs);

module.exports = router;