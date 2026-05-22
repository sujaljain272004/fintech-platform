const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    senderUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderWallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    receiverWallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    senderSnapshot: {
      fullName: String,
      phoneNumber: String,
      walletNumber: String,
    },
    receiverSnapshot: {
      fullName: String,
      phoneNumber: String,
      walletNumber: String,
    },
    senderPhone: {
      type: String,
      required: true,
      index: true,
    },
    receiverPhone: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    fee: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    note: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    channel: {
      type: String,
      default: "wallet_transfer",
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
    blockchain: {
      index: Number,
      hash: String,
      previousHash: String,
      payloadHash: String,
      timestamp: String,
      protocol: String,
      verifiedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
