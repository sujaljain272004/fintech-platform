const AIInsight = require("../models/AIInsight");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { generateFinancialInsight } = require("../services/openaiService");
const { createNotification } = require("../services/notificationService");

const normalizeTransactions = (transactions, userId) =>
  transactions.map((transaction) => {
    const isSender = transaction.senderUser.equals(userId);
    return {
      amount: transaction.amount,
      direction: isSender ? "sent" : "received",
      note: transaction.note,
      reference: transaction.reference,
      createdAt: transaction.createdAt,
      counterpartyName: isSender
        ? transaction.receiverSnapshot?.fullName
        : transaction.senderSnapshot?.fullName,
    };
  });

const getLatestInsight = asyncHandler(async (req, res) => {
  if (!req.appUser) {
    throw new AppError("Wallet profile not found.", 404);
  }

  const latestInsight = await AIInsight.findOne({ user: req.appUser._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: latestInsight,
  });
});

const generateInsight = asyncHandler(async (req, res) => {
  if (!req.appUser || !req.appWallet) {
    throw new AppError("Wallet profile not found.", 404);
  }

  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - 60);

  const transactions = await Transaction.find({
    $or: [{ senderUser: req.appUser._id }, { receiverUser: req.appUser._id }],
    status: "completed",
    createdAt: { $gte: periodStart, $lte: periodEnd },
  })
    .sort({ createdAt: -1 })
    .lean();

  const normalizedTransactions = normalizeTransactions(transactions, req.appUser._id);
  const generated = await generateFinancialInsight({
    user: req.appUser.toObject(),
    wallet: req.appWallet.toObject(),
    transactions: normalizedTransactions,
  });

  const insight = await AIInsight.create({
    user: req.appUser._id,
    summary: generated.summary,
    spendingPattern: generated.spendingPattern,
    savingsTip: generated.savingsTip,
    riskLevel: generated.riskLevel,
    cashFlowStatus: generated.cashFlowStatus,
    financialHealthScore: generated.financialHealthScore,
    recommendations: generated.recommendations,
    categories: generated.categories,
    source: generated.source,
    periodStart,
    periodEnd,
    model: generated.model,
  });

  await createNotification({
    user: req.appUser._id,
    title: "Fresh AI insight ready",
    message: "Your latest spending and savings guidance has been updated.",
    type: "ai_insight",
    metadata: { insightId: insight._id },
  });

  res.status(201).json({
    success: true,
    data: insight,
  });
});

module.exports = {
  getLatestInsight,
  generateInsight,
};
