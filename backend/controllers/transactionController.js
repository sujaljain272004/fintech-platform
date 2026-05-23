const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { verifyLedgerEntry } = require("../blockchain/ledger");
const { mapTransactionForViewer } = require("./walletController");

const buildTransactionQuery = (req, { includeAllUsers = false } = {}) => {
  const query = {};
  const phone = String(req.query.phone || req.query.search || "").trim();
  const recipient = String(req.query.recipient || "").trim();
  const transactionId = String(req.query.transactionId || req.query.id || "").trim();
  const status = String(req.query.status || "").trim().toLowerCase();
  const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : null;
  const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : null;
  const minAmount = req.query.minAmount ? Number(req.query.minAmount) : null;
  const maxAmount = req.query.maxAmount ? Number(req.query.maxAmount) : null;
  const sortBy = String(req.query.sortBy || "createdAt");
  const sortOrder = String(req.query.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;

  if (!includeAllUsers) {
    query.$or = [{ senderUser: req.appUser._id }, { receiverUser: req.appUser._id }];
  }

  if (transactionId) {
    query._id = transactionId;
  }

  if (status) {
    query.status = status;
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom && !Number.isNaN(dateFrom.getTime())) {
      query.createdAt.$gte = dateFrom;
    }
    if (dateTo && !Number.isNaN(dateTo.getTime())) {
      query.createdAt.$lte = dateTo;
    }
  }

  if (minAmount !== null && !Number.isNaN(minAmount)) {
    query.amount = { ...(query.amount || {}), $gte: minAmount };
  }

  if (maxAmount !== null && !Number.isNaN(maxAmount)) {
    query.amount = { ...(query.amount || {}), $lte: maxAmount };
  }

  if (phone) {
    query.$and = [
      ...(query.$and || []),
      {
        $or: [
          { senderPhone: { $regex: phone, $options: "i" } },
          { receiverPhone: { $regex: phone, $options: "i" } },
          { "senderSnapshot.fullName": { $regex: phone, $options: "i" } },
          { "receiverSnapshot.fullName": { $regex: phone, $options: "i" } },
          { reference: { $regex: phone, $options: "i" } },
          { note: { $regex: phone, $options: "i" } },
        ],
      },
    ];
  }

  if (recipient) {
    query.$and = [
      ...(query.$and || []),
      {
        $or: [
          { "receiverSnapshot.fullName": { $regex: recipient, $options: "i" } },
          { receiverPhone: { $regex: recipient, $options: "i" } },
          { reference: { $regex: recipient, $options: "i" } },
        ],
      },
    ];
  }

  return { query, sortBy, sortOrder };
};

const getTransactions = asyncHandler(async (req, res) => {
  if (!req.appUser) {
    throw new AppError("Wallet profile not found.", 404);
  }

  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const { query, sortBy, sortOrder } = buildTransactionQuery(req);

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: transactions.map((transaction) => mapTransactionForViewer(transaction, req.appUser._id)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      hasMore: page * limit < total,
    },
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
