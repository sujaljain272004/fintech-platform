const express = require("express");
const authRoutes = require("./authRoutes");
const onboardingRoutes = require("./onboardingRoutes");
const walletRoutes = require("./walletRoutes");
const transactionRoutes = require("./transactionRoutes");
const insightRoutes = require("./insightRoutes");
const notificationRoutes = require("./notificationRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "FinLink backend is healthy.",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/wallet", walletRoutes);
router.use("/transactions", transactionRoutes);
router.use("/insights", insightRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;
