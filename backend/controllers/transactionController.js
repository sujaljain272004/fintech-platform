const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { verifyLedgerEntry } = require("../blockchain/ledger");
const { mapTransactionForViewer } = require("./walletController");

const getTransactions = asyncHandler(async (req, res) => {
  if (!req.appUser) {
    throw new AppError("Wallet profile not found.", 404);
  }

  const transactions = await Transaction.find({
    $or: [{ senderUser: req.appUser._id }, { receiverUser: req.appUser._id }],
  })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: transactions.map((transaction) =>
      mapTransactionForViewer(transaction, req.appUser._id)
    ),
  });
});

const verifyTransaction = asyncHandler(async (req, res) => {
  if (!req.appUser) {
    throw new AppError("Wallet profile not found.", 404);
  }

  const transaction = await Transaction.findOne({
    _id: req.params.id,
    $or: [{ senderUser: req.appUser._id }, { receiverUser: req.appUser._id }],
  }).lean();

  if (!transaction) {
    throw new AppError("Transaction not found.", 404);
  }

  const isVerified = verifyLedgerEntry(transaction);

  res.json({
    success: true,
    data: {
      transactionId: transaction._id,
      reference: transaction.reference,
      verified: isVerified,
      hash: transaction.blockchain?.hash || "",
      previousHash: transaction.blockchain?.previousHash || "",
    },
  });
});

module.exports = {
  getTransactions,
  verifyTransaction,
};
