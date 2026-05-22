const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: String,
    amount: Number,
    percentage: Number,
  },
  { _id: false }
);

const aiInsightSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    spendingPattern: {
      type: String,
      required: true,
    },
    savingsTip: {
      type: String,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ["low", "moderate", "high"],
      default: "low",
    },
    cashFlowStatus: {
      type: String,
      required: true,
    },
    financialHealthScore: {
      type: Number,
      default: 75,
    },
    recommendations: {
      type: [String],
      default: [],
    },
    categories: {
      type: [categorySchema],
      default: [],
    },
    source: {
      type: String,
      default: "fallback",
    },
    periodStart: Date,
    periodEnd: Date,
    model: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AIInsight", aiInsightSchema);
