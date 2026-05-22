const mongoose = require("mongoose");
const { body } = require("express-validator");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const AIInsight = require("../models/AIInsight");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { buildLedgerEntry } = require("../blockchain/ledger");
const { createManyNotifications } = require("../services/notificationService");
const {
  findUserWalletByPhone,
  buildRecipientPreview,
} = require("../services/userLifecycleService");
const { assertValidInternationalPhone } = require("../utils/phone");

const mapTransactionForViewer = (transaction, viewerId) => {
  const isSender = transaction.senderUser._id
    ? transaction.senderUser._id.equals(viewerId)
    : transaction.senderUser.equals(viewerId);
  const counterparty = isSender ? transaction.receiverSnapshot : transaction.senderSnapshot;

  return {
    id: transaction._id,
    amount: transaction.amount,
    direction: isSender ? "sent" : "received",
    currency: transaction.currency,
    fee: transaction.fee,
    status: transaction.status,
    note: transaction.note,
    reference: transaction.reference,
    counterpartyName: counterparty?.fullName || "FinLink user",
    counterpartyPhone: counterparty?.phoneNumber || "",
    counterpartyWallet: counterparty?.walletNumber || "",
    blockchain: transaction.blockchain,
    senderPhone: transaction.senderPhone,
    receiverPhone: transaction.receiverPhone,
    createdAt: transaction.createdAt,
  };
};

const getDashboard = asyncHandler(async (req, res) => {
  if (!req.appUser || !req.appWallet) {
    throw new AppError("Wallet profile not found. Please sign in again.", 404);
  }

  const [recentTransactions, latestInsight, unreadCount, totalSent, totalReceived] =
    await Promise.all([
      Transaction.find({
        $or: [{ senderUser: req.appUser._id }, { receiverUser: req.appUser._id }],
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      AIInsight.findOne({ user: req.appUser._id }).sort({ createdAt: -1 }).lean(),
      Notification.countDocuments({ user: req.appUser._id, read: false }),
      Transaction.aggregate([
        { $match: { senderUser: req.appUser._id, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { receiverUser: req.appUser._id, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

  res.json({
    success: true,
    data: {
      profile: {
        fullName: req.appUser.fullName,
        phoneNumber: req.appUser.phoneNumber,
        preferredLanguage: req.appUser.preferredLanguage,
        avatarColor: req.appUser.avatarColor,
      },
      wallet: {
        walletNumber: req.appWallet.walletNumber,
        balance: req.appWallet.balance,
        currency: req.appWallet.currency,
        isActive: req.appWallet.isActive,
      },
      summary: {
        totalSent: totalSent[0]?.total || 0,
        totalReceived: totalReceived[0]?.total || 0,
        unreadNotifications: unreadCount,
      },
      recentTransactions: recentTransactions.map((transaction) =>
        mapTransactionForViewer(transaction, req.appUser._id)
      ),
      latestInsight,
    },
  });
});

const transferValidators = [
  body("recipient")
    .trim()
    .notEmpty()
    .withMessage("Recipient phone or wallet number is required."),
  body("recipientType")
    .optional()
    .isIn(["phone", "wallet"])
    .withMessage("Recipient type must be phone or wallet."),
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than zero."),
  body("note")
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage("Note can be up to 160 characters long."),
];

const getWallet = asyncHandler(async (req, res) => {
  if (!req.appUser || !req.appWallet) {
    throw new AppError("Wallet profile not found. Please sign in again.", 404);
  }

  res.json({
    success: true,
    data: {
      profile: {
        id: req.appUser._id,
        fullName: req.appUser.fullName,
        phoneNumber: req.appUser.phoneNumber,
        avatarColor: req.appUser.avatarColor,
        kycStatus: req.appUser.kycStatus,
      },
      wallet: {
        id: req.appWallet._id,
        walletNumber: req.appWallet.walletNumber,
        balance: req.appWallet.balance,
        currency: req.appWallet.currency,
        isActive: req.appWallet.isActive,
      },
    },
  });
});

const getRecipientPreview = asyncHandler(async (req, res) => {
  const phoneNumber = req.query.phone;

  if (!phoneNumber) {
    throw new AppError("Phone number is required.", 422);
  }

  let recipientAccount;

  try {
    recipientAccount = await findUserWalletByPhone(phoneNumber);
  } catch (error) {
    if (error.code === "INVALID_PHONE") {
      throw new AppError(error.message, 422);
    }
    throw error;
  }

  if (!recipientAccount) {
    throw new AppError("User not found.", 404);
  }

  if (recipientAccount.user._id.equals(req.appUser._id)) {
    throw new AppError("You cannot send money to your own phone number.", 400);
  }

  res.json({
    success: true,
    data: buildRecipientPreview(recipientAccount),
  });
});

const transferMoney = asyncHandler(async (req, res) => {
  if (!req.appUser || !req.appWallet) {
    throw new AppError("Wallet profile not found. Please sign in again.", 404);
  }

  const { recipient, recipientType = "phone", amount, note = "" } = req.body;
  const transferAmount = Number(amount);

  if (recipientType === "phone") {
    try {
      assertValidInternationalPhone(recipient.trim());
    } catch (error) {
      if (error.code === "INVALID_PHONE") {
        throw new AppError(error.message, 422);
      }
      throw error;
    }
  }

  const dbSession = await mongoose.startSession();
  let transactionRecord;

  try {
    await dbSession.withTransaction(async () => {
      const senderWallet = await Wallet.findById(req.appWallet._id).session(dbSession);
      const senderUser = await User.findById(req.appUser._id).session(dbSession);

      let receiverUser;
      let receiverWallet;

      if (recipientType === "wallet") {
        receiverWallet = await Wallet.findOne({ walletNumber: recipient.trim() }).session(dbSession);
        receiverUser = receiverWallet
          ? await User.findById(receiverWallet.user).session(dbSession)
          : null;
      } else {
        const recipientAccount = await findUserWalletByPhone(recipient.trim(), dbSession);

        if (!recipientAccount) {
          throw new AppError("User not found.", 404);
        }

        receiverUser = recipientAccount.user;
        receiverWallet = recipientAccount.wallet;
      }

      if (!receiverWallet || !receiverUser) {
        throw new AppError("Recipient wallet was not found. Check the phone or wallet number.", 404);
      }

      if (senderUser.accountStatus !== "active" || senderUser.kycStatus !== "verified") {
        throw new AppError("Complete and verify onboarding before sending money.", 403);
      }

      if (receiverUser.accountStatus !== "active" || receiverUser.kycStatus !== "verified") {
        throw new AppError(
          "Recipient wallet not found. Ask the recipient to sign in once using their phone number to activate their wallet.",
          403
        );
      }

      if (receiverUser._id.equals(senderUser._id)) {
        throw new AppError("You cannot transfer money to your own wallet.", 400);
      }

      if (senderWallet.balance < transferAmount) {
        throw new AppError("Insufficient wallet balance for this transfer.", 400);
      }

      senderWallet.balance -= transferAmount;
      receiverWallet.balance += transferAmount;
      senderWallet.lastTransactionAt = new Date();
      receiverWallet.lastTransactionAt = new Date();

      await senderWallet.save({ session: dbSession });
      await receiverWallet.save({ session: dbSession });

      const reference = `REM-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
      const ledgerEntry = await buildLedgerEntry(
        {
          reference,
          from: senderWallet.walletNumber,
          to: receiverWallet.walletNumber,
          amount: transferAmount,
          fee: 0,
          note,
        },
        dbSession
      );

      const [createdTransaction] = await Transaction.create(
        [
          {
            senderUser: senderUser._id,
            receiverUser: receiverUser._id,
            senderWallet: senderWallet._id,
            receiverWallet: receiverWallet._id,
            senderSnapshot: {
              fullName: senderUser.fullName,
              phoneNumber: senderUser.phoneNumber,
              walletNumber: senderWallet.walletNumber,
            },
            receiverSnapshot: {
              fullName: receiverUser.fullName,
              phoneNumber: receiverUser.phoneNumber,
              walletNumber: receiverWallet.walletNumber,
            },
            senderPhone: senderUser.phoneNumber,
            receiverPhone: receiverUser.phoneNumber,
            amount: transferAmount,
            fee: 0,
            netAmount: transferAmount,
            currency: senderWallet.currency,
            note,
            reference,
            blockchain: ledgerEntry,
            status: "completed",
          },
        ],
        { session: dbSession }
      );

      await createManyNotifications(
        [
          {
            user: senderUser._id,
            title: "Transfer sent",
            message: `You sent ₹${transferAmount.toLocaleString("en-IN")} to ${receiverUser.fullName} with zero fees.`,
            type: "transfer_sent",
            metadata: { reference, amount: transferAmount },
          },
          {
            user: receiverUser._id,
            title: "Money received",
            message: `You received ₹${transferAmount.toLocaleString("en-IN")} from ${senderUser.fullName}.`,
            type: "transfer_received",
            metadata: { reference, amount: transferAmount },
          },
        ],
        dbSession
      );

      transactionRecord = createdTransaction;
    });
  } finally {
    await dbSession.endSession();
  }

  res.status(201).json({
    success: true,
    message: "Transfer completed successfully with zero fees.",
    data: {
      ...mapTransactionForViewer(transactionRecord, req.appUser._id),
      successReceipt: {
        amount: transactionRecord.amount,
        receiverName: transactionRecord.receiverSnapshot?.fullName,
        transactionId: transactionRecord.reference,
        timestamp: transactionRecord.createdAt,
        blockchainVerified: true,
        hash: transactionRecord.blockchain?.hash,
      },
    },
  });
});

module.exports = {
  getWallet,
  getRecipientPreview,
  getDashboard,
  transferMoney,
  transferValidators,
  mapTransactionForViewer,
};
