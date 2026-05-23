const OpenAI = require("openai");
const env = require("../config/env");
const { summarizeHeuristics } = require("../utils/aiFallback");

const client = env.groqApiKey
  ? new OpenAI({
      apiKey: env.groqApiKey,
      baseURL: env.groqBaseUrl,
    })
  : null;

const clampScore = (score) => Math.max(30, Math.min(100, Math.round(Number(score || 0))));

const sanitizeText = (value, fallback) => {
  const text = String(value || "").trim();
  return text || fallback;
};

const extractJson = (content = "") => {
  const trimmed = String(content).trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fencedMatch ? fencedMatch[1].trim() : trimmed;
  return JSON.parse(jsonText);
};

const normalizeTransactions = (transactions = []) =>
  transactions.map((transaction) => ({
    amount: Number(transaction.amount),
    direction: transaction.direction,
    note: transaction.note,
    reference: transaction.reference,
    createdAt: transaction.createdAt,
    counterpartyName: transaction.counterpartyName,
  }));

const buildFlowProfile = (transactions = [], wallet = {}) => {
  const sent = transactions.filter((transaction) => transaction.direction === "sent");
  const received = transactions.filter((transaction) => transaction.direction === "received");
  const sentTotal = sent.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const receivedTotal = received.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const largestOutgoing = sent.reduce(
    (largest, transaction) => Math.max(largest, Number(transaction.amount || 0)),
    0
  );

  return {
    transactionCount: transactions.length,
    sentCount: sent.length,
    receivedCount: received.length,
    sentTotal,
    receivedTotal,
    netFlow: receivedTotal - sentTotal,
    walletBalance: Number(wallet.balance || 0),
    largestOutgoing,
    averageOutgoing: sent.length ? Math.round(sentTotal / sent.length) : 0,
  };
};

const buildUserProfile = (user = {}) => ({
  fullName: user.fullName,
  preferredLanguage: user.preferredLanguage,
  currency: user.currency || "INR",
  occupation: user.occupation || "Not provided",
  monthlyIncomeRange: user.monthlyIncomeRange || "Not provided",
  walletUsagePurpose: user.walletUsagePurpose || "General wallet use",
  kycStatus: user.kycStatus,
  accountStatus: user.accountStatus,
});

const normalizeInsight = (candidate, fallback) => {
  const recommendations = Array.isArray(candidate.recommendations)
    ? candidate.recommendations.map((item) => String(item).trim()).filter(Boolean).slice(0, 5)
    : fallback.recommendations;

  const categories = Array.isArray(candidate.categories)
    ? candidate.categories
        .map((category) => ({
          name: sanitizeText(category.name, "Other"),
          amount: Number(category.amount || 0),
          percentage: Math.max(0, Math.min(100, Number(category.percentage || 0))),
        }))
        .filter((category) => category.amount > 0 || category.percentage > 0)
        .slice(0, 6)
    : fallback.categories;

  const riskLevel = ["low", "moderate", "high"].includes(candidate.riskLevel)
    ? candidate.riskLevel
    : fallback.riskLevel;

  return {
    summary: sanitizeText(candidate.summary, fallback.summary),
    spendingPattern: sanitizeText(candidate.spendingPattern, fallback.spendingPattern),
    savingsTip: sanitizeText(candidate.savingsTip, fallback.savingsTip),
    riskLevel,
    cashFlowStatus: sanitizeText(candidate.cashFlowStatus, fallback.cashFlowStatus),
    financialHealthScore: clampScore(candidate.financialHealthScore || fallback.financialHealthScore),
    recommendations: recommendations.length ? recommendations : fallback.recommendations,
    categories: categories.length ? categories : fallback.categories,
  };
};

const generateFinancialInsight = async ({ user, wallet, transactions }) => {
  const normalizedTransactions = normalizeTransactions(transactions);
  const fallback = summarizeHeuristics(normalizedTransactions, wallet, user);

  if (!client) {
    return {
      ...fallback,
      source: "fallback_no_groq_api_key",
      model: "heuristic-engine",
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: env.groqModel,
      temperature: 0.35,
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are FinLink's financial inclusion insight engine for migrant workers and underserved users. Return only valid JSON. Make the output specific to the user's wallet purpose, occupation, income range, transaction history, and cash-flow signals. Keep advice practical, short, non-judgmental, and safe. Do not promise returns or recommend risky investments.",
        },
        {
          role: "user",
          content: JSON.stringify({
            task:
              "Create a dynamic financial insight report. Required JSON keys: summary, spendingPattern, savingsTip, riskLevel, cashFlowStatus, financialHealthScore, recommendations, categories. riskLevel must be low, moderate, or high. financialHealthScore must be 0-100. categories must contain name, amount, percentage.",
            userProfile: buildUserProfile(user),
            wallet: {
              balance: Number(wallet?.balance || 0),
              currency: wallet?.currency || user?.currency || "INR",
              lastTransactionAt: wallet?.lastTransactionAt || null,
            },
            flowProfile: buildFlowProfile(normalizedTransactions, wallet),
            transactions: normalizedTransactions.slice(0, 40),
            fallbackBaseline: fallback,
          }),
        },
      ],
    });

    const parsed = extractJson(response.choices?.[0]?.message?.content || "{}");

    return {
      ...normalizeInsight(parsed, fallback),
      source: "groq",
      model: env.groqModel,
    };
  } catch (error) {
    return {
      ...fallback,
      source: "fallback_after_groq_error",
      model: "heuristic-engine",
      errorMessage: error.message,
    };
  }
};

module.exports = {
  generateFinancialInsight,
};
