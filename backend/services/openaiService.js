const OpenAI = require("openai");
const env = require("../config/env");
const { summarizeHeuristics } = require("../utils/aiFallback");

const client = env.openAiApiKey ? new OpenAI({ apiKey: env.openAiApiKey }) : null;

const insightSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    spendingPattern: { type: "string" },
    savingsTip: { type: "string" },
    riskLevel: { type: "string", enum: ["low", "moderate", "high"] },
    cashFlowStatus: { type: "string" },
    financialHealthScore: { type: "number" },
    recommendations: {
      type: "array",
      items: { type: "string" },
    },
    categories: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          amount: { type: "number" },
          percentage: { type: "number" },
        },
        required: ["name", "amount", "percentage"],
      },
    },
  },
  required: [
    "summary",
    "spendingPattern",
    "savingsTip",
    "riskLevel",
    "cashFlowStatus",
    "financialHealthScore",
    "recommendations",
    "categories",
  ],
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

const generateFinancialInsight = async ({ user, wallet, transactions }) => {
  const fallback = summarizeHeuristics(transactions, wallet);

  if (!transactions.length || !client) {
    return {
      ...fallback,
      source: client ? "fallback" : "fallback_no_api_key",
      model: client ? env.openAiModel : "heuristic-engine",
    };
  }

  try {
    const response = await client.responses.create({
      model: env.openAiModel,
      input: [
        {
          role: "developer",
          content:
            "You are a financial inclusion assistant for migrant workers. Return JSON only. Keep advice practical, empathetic, short, and safe. Avoid investment hype and avoid promising returns.",
        },
        {
          role: "user",
          content: `Analyze this wallet activity and produce a JSON insight report: ${JSON.stringify(
            {
              customer: {
                fullName: user.fullName,
                preferredLanguage: user.preferredLanguage,
                currency: user.currency,
                balance: wallet.balance,
              },
              transactions: normalizeTransactions(transactions),
            }
          )}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "financial_insight",
          strict: true,
          schema: insightSchema,
        },
      },
    });

    const parsed = JSON.parse(response.output_text);

    return {
      ...parsed,
      source: "openai",
      model: env.openAiModel,
    };
  } catch (error) {
    return {
      ...fallback,
      source: "fallback_after_openai_error",
      model: "heuristic-engine",
      errorMessage: error.message,
    };
  }
};

module.exports = {
  generateFinancialInsight,
};
