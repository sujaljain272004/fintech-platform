const categoryMatchers = [
  { name: "Family Support", keywords: ["home", "family", "mother", "father", "rent"], color: "#0f766e" },
  { name: "Food", keywords: ["food", "meal", "grocery", "lunch", "dinner"], color: "#f59e0b" },
  { name: "Transport", keywords: ["bus", "taxi", "travel", "metro", "fuel"], color: "#2563eb" },
  { name: "Health", keywords: ["clinic", "doctor", "medicine", "health"], color: "#dc2626" },
  { name: "Utilities", keywords: ["bill", "electricity", "water", "mobile", "recharge"], color: "#7c3aed" },
];

const detectCategory = (text = "") => {
  const lowered = text.toLowerCase();
  const matched = categoryMatchers.find((item) =>
    item.keywords.some((keyword) => lowered.includes(keyword))
  );

  return matched || { name: "Savings & Other", color: "#14b8a6" };
};

const summarizeHeuristics = (transactions, wallet) => {
  const outgoing = transactions.filter(
    (transaction) => transaction.direction === "sent" || transaction.amount < 0
  );

  const totalSpent = outgoing.reduce(
    (sum, transaction) => sum + Math.abs(Number(transaction.amount || 0)),
    0
  );

  const categoryMap = outgoing.reduce((accumulator, transaction) => {
    const category = detectCategory(
      `${transaction.note || ""} ${transaction.reference || ""} ${transaction.counterpartyName || ""}`
    );
    accumulator[category.name] = (accumulator[category.name] || 0) + Math.abs(transaction.amount);
    return accumulator;
  }, {});

  const categories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalSpent ? Number(((amount / totalSpent) * 100).toFixed(1)) : 0,
    }));

  const primaryCategory = categories[0]?.name || "Savings & Other";
  const balance = Number(wallet?.balance || 0);
  const healthScore = Math.max(
    58,
    Math.min(92, Math.round(78 + (balance > totalSpent ? 8 : -6)))
  );

  return {
    summary: totalSpent
      ? `Most recent spending is concentrated around ${primaryCategory.toLowerCase()}, while your wallet still keeps a workable buffer for essential transfers.`
      : "Your wallet activity is still light, which is a good moment to build a regular savings pattern before spending grows.",
    spendingPattern: totalSpent
      ? `You are currently spending about ${primaryCategory.toLowerCase()} most often, with zero transfer fees helping more money reach the destination.`
      : "You are using the wallet carefully and have not built a heavy expense pattern yet.",
    savingsTip:
      balance > totalSpent
        ? "Move a small fixed amount after each payday into a savings goal so transfers home never affect your emergency cushion."
        : "Keep 10% of your next inflow untouched to rebuild a stronger safety buffer before non-essential spending.",
    riskLevel: balance >= totalSpent ? "low" : "moderate",
    cashFlowStatus:
      balance >= totalSpent ? "Stable cash flow with room for disciplined saving." : "Cash flow is active, but your spending is close to your available buffer.",
    financialHealthScore: healthScore,
    recommendations: [
      "Schedule one weekly transfer instead of many small transfers to keep your balance easier to track.",
      "Review your last three outgoing payments and label them so future AI insights become more accurate.",
      "Keep at least one week of expenses in the wallet as an emergency reserve.",
    ],
    categories,
  };
};

module.exports = {
  summarizeHeuristics,
};
