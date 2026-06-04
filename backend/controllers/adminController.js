const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const AuthLog = require("../models/AuthLog");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { mapTransactionForViewer } = require("./walletController");
const { createAuthLog } = require("../services/authLogService");
const { createNotification } = require("../services/notificationService");

const buildAdminTransactionQuery = (queryParams = {}) => {
  const query = {};
  const search = String(queryParams.search || queryParams.phone || queryParams.transactionId || "").trim();
  const status = String(queryParams.status || "").trim().toLowerCase();
  const userId = String(queryParams.userId || "").trim();
  const dateFrom = queryParams.dateFrom ? new Date(queryParams.dateFrom) : null;
  const dateTo = queryParams.dateTo ? new Date(queryParams.dateTo) : null;
  const minAmount = queryParams.minAmount ? Number(queryParams.minAmount) : null;
  const maxAmount = queryParams.maxAmount ? Number(queryParams.maxAmount) : null;

  if (search) {
    query.$or = [
      { reference: { $regex: search, $options: "i" } },
      { senderPhone: { $regex: search, $options: "i" } },
      { receiverPhone: { $regex: search, $options: "i" } },
      { "senderSnapshot.fullName": { $regex: search, $options: "i" } },
      { "receiverSnapshot.fullName": { $regex: search, $options: "i" } },
      { note: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    query.status = status;
  }

  if (userId) {
    query.$and = [...(query.$and || []), { $or: [{ senderUser: userId }, { receiverUser: userId }] }];
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

  return query;
};

const dashboard = asyncHandler(async (req, res) => {
  await createAuthLog({
    user: req.appUser,
    phoneNumber: req.appUser.phoneNumber,
    eventType: "admin_access",
    status: "info",
    req,
    metadata: { route: "/admin/dashboard" },
  });

  const [totalUsers, activeUsers, totalTransactions, failedTransactions, totalVolume, totalWallets, recentAuthLogs] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ accountStatus: "active" }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: "failed" }),
      Transaction.aggregate([{ $match: { status: "completed" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Wallet.countDocuments({ isActive: true }),
      AuthLog.find().sort({ createdAt: -1 }).limit(8).lean(),
    ]);

  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(8).lean();
  const transactionTrend = await Transaction.aggregate([
    { $match: { status: { $in: ["completed", "failed", "pending", "reversed"] } } },
    {
      $group: {
        _id: { month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, status: "$status" },
        total: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  res.json({
    success: true,
    data: {
      summary: {
        totalUsers,
        activeUsers,
        totalTransactions,
        failedTransactions,
        totalVolume: totalVolume[0]?.total || 0,
        activeWallets: totalWallets,
      },
      recentUsers,
      recentAuthLogs,
      transactionTrend,
    },
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const search = String(req.query.search || "").trim();
  const role = String(req.query.role || "").trim().toUpperCase();
  const status = String(req.query.status || "").trim();
  const query = {};

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { phoneNumber: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    query.role = role;
  }

  if (status) {
    query.accountStatus = status;
  }

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1), hasMore: page * limit < total },
  });
});

const listTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const query = buildAdminTransactionQuery(req.query);
  const sortBy = String(req.query.sortBy || "createdAt");
  const sortOrder = String(req.query.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;

  const [transactions, total] = await Promise.all([
    Transaction.find(query).sort({ [sortBy]: sortOrder }).skip((page - 1) * limit).limit(limit).lean(),
    Transaction.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: transactions.map((transaction) => mapTransactionForViewer(transaction, transaction.senderUser)),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1), hasMore: page * limit < total },
  });
});

const listAuthLogs = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const search = String(req.query.search || "").trim();
  const eventType = String(req.query.eventType || "").trim();
  const query = {};

  if (search) {
    query.$or = [
      { phoneNumber: { $regex: search, $options: "i" } },
      { ipAddress: { $regex: search, $options: "i" } },
      { eventType: { $regex: search, $options: "i" } },
    ];
  }

  if (eventType) {
    query.eventType = eventType;
  }

  const [logs, total] = await Promise.all([
    AuthLog.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    AuthLog.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: logs,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1), hasMore: page * limit < total },
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status || !["active", "restricted"].includes(status)) {
    throw new AppError("Status must be active or restricted.", 422);
  }

  const user = await User.findByIdAndUpdate(req.params.id, { accountStatus: status }, { new: true }).lean();
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  res.json({ success: true, data: user });
});

const approveUserKyc = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  user.kycStatus = "verified";
  user.verificationStatus = "kyc_verified";
  user.onboardingComplete = true;
  user.accountStatus = "active";
  user.lastLoginAt = new Date();
  await user.save();

  const wallet = await Wallet.findOne({ user: user._id }).lean();

  await Promise.all([
    createNotification({
      user: user._id,
      title: "KYC approved",
      message: "Your account verification is complete. Wallet actions are now fully enabled.",
      type: "security",
      metadata: { approvedBy: req.appUser._id, walletNumber: wallet?.walletNumber || null },
    }),
    createAuthLog({
      user: req.appUser,
      phoneNumber: req.appUser.phoneNumber,
      eventType: "admin_access",
      status: "info",
      req,
      metadata: { route: `/admin/users/${user._id}/kyc`, action: "approve" },
    }),
  ]);

  res.json({
    success: true,
    message: "User KYC approved.",
    data: user.toObject(),
  });
});

const reverseTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    throw new AppError("Transaction not found.", 404);
  }

  if (transaction.status === "reversed") {
    throw new AppError("Transaction already reversed.", 400);
  }

  transaction.status = "reversed";
  transaction.blockchain = {
    ...(transaction.blockchain || {}),
    verifiedAt: new Date(),
  };
  await transaction.save();

  res.json({
    success: true,
    data: mapTransactionForViewer(transaction.toObject(), transaction.senderUser),
  });
});

module.exports = {
  dashboard,
  listUsers,
  listTransactions,
  listAuthLogs,
  updateUserStatus,
  approveUserKyc,
  reverseTransaction,
};