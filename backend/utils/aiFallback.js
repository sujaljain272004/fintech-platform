const categoryMatchers = [
  { name: "Family Support", keywords: ["home", "family", "mother", "father", "parents", "rent", "school fee"] },
  { name: "Food", keywords: ["food", "meal", "grocery", "lunch", "dinner", "ration"] },
  { name: "Transport", keywords: ["bus", "taxi", "travel", "metro", "fuel", "train"] },
  { name: "Health", keywords: ["clinic", "doctor", "medicine", "health", "hospital", "pharmacy"] },
  { name: "Utilities", keywords: ["bill", "electricity", "water", "mobile", "recharge", "gas"] },
  { name: "Savings", keywords: ["saving", "savings", "deposit", "emergency", "goal"] },
];

const detectCategory = (text = "") => {
  const lowered = text.toLowerCase();
  const matched = categoryMatchers.find((item) =>
    item.keywords.some((keyword) => lowered.includes(keyword))
  );

  return matched || { name: "Other" };
};

const buildRecommendationSet = ({ balance, receivedTotal, totalSpent, primaryCategory, user }) => {
  const walletPurpose = String(user?.walletUsagePurpose || "").toLowerCase();
  const recommendations = [];

  if (receivedTotal > 0 && totalSpent > receivedTotal * 0.8) {
    recommendations.push("Slow down outgoing transfers until the next inflow so the wallet keeps a usable buffer.");
  }

  if (balance < Math.max(500, totalSpent * 0.15)) {
    recommendations.push("Keep the next small inflow in the wallet first, then transfer the remaining amount after essentials are covered.");
  }

  if (primaryCategory !== "Other") {
    recommendations.push(`Review ${primaryCategory.toLowerCase()} payments this week and tag the most important ones for clearer future insights.`);
  }

  if (walletPurpose.includes("family") || walletPurpose.includes("home") || primaryCategory === "Family Support") {
    recommendations.push("Group family-support transfers into one planned weekly or monthly payment to reduce balance surprises.");
  }

  if (walletPurpose.includes("saving") || walletPurpose.includes("emergency")) {
    recommendations.push("Move a fixed amount into your savings goal immediately after each incoming payment.");
  }

  if (recommendations.length < 3) {
    recommendations.push("Label every outgoing transfer with its purpose so the next AI insight can separate needs from optional spending.");
    recommendations.push("Keep at least one week of essential expenses untouched as an emergency reserve.");
  }

  return recommendations.slice(0, 4);
};

const summarizeHeuristics = (transactions = [], wallet = {}, user = {}) => {
  const outgoing = transactions.filter(
    (transaction) => transaction.direction === "sent" || transaction.amount < 0
  );
  const incoming = transactions.filter((transaction) => transaction.direction === "received");

  const totalSpent = outgoing.reduce(
    (sum, transaction) => sum + Math.abs(Number(transaction.amount || 0)),
    0
  );
  const receivedTotal = incoming.reduce(
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

  const primaryCategory = categories[0]?.name || "Other";
  const balance = Number(wallet?.balance || 0);
  const netFlow = receivedTotal - totalSpent;
  const balanceCoverage = totalSpent ? balance / totalSpent : balance > 0 ? 2 : 0;
  const flowScore = receivedTotal >= totalSpent ? 18 : Math.max(0, Math.round((receivedTotal / Math.max(totalSpent, 1)) * 18));
  const bufferScore = Math.min(30, Math.round(balanceCoverage * 18));
  const activityScore = Math.min(18, transactions.length * 3);
  const healthScore = Math.max(35, Math.min(96, 42 + flowScore + bufferScore + activityScore));
  const riskLevel = healthScore >= 76 ? "low" : healthScore >= 55 ? "moderate" : "high";
  const usagePurpose = user?.walletUsagePurpose || "general wallet use";
  const occupation = user?.occupation ? ` as a ${user.occupation}` : "";
  const recommendations = buildRecommendationSet({
    balance,
    receivedTotal,
    totalSpent,
    primaryCategory,
    user,
  });

  return {
    summary: transactions.length
      ? `Based on ${transactions.length} recent wallet movements, your ${usagePurpose.toLowerCase()} usage${occupation} shows ${netFlow >= 0 ? "positive" : "tight"} cash flow with ${primaryCategory.toLowerCase()} as the main outgoing area.`
      : `Your wallet has no recent completed transactions yet, so the first insight is based on your ${usagePurpose.toLowerCase()} profile and current balance.`,
    spendingPattern: totalSpent
      ? `You sent ${totalSpent.toLocaleString("en-IN")} and received ${receivedTotal.toLocaleString("en-IN")} in the current window; ${primaryCategory.toLowerCase()} makes up ${categories[0]?.percentage || 0}% of outgoing use.`
      : "No outgoing transfer pattern is visible yet; future insights will become more specific after a few labelled transactions.",
    savingsTip:
      balanceCoverage >= 0.5
        ? "Keep a fixed reserve before making the next transfer so planned support does not reduce emergency cash."
        : "Hold back a small part of the next incoming payment first, then send the remaining amount after essentials are covered.",
    riskLevel,
    cashFlowStatus:
      netFlow >= 0
        ? "Incoming funds currently cover outgoing transfers in the selected period."
        : "Outgoing transfers are higher than incoming funds in the selected period.",
    financialHealthScore: healthScore,
    recommendations,
    categories,
  };
};

module.exports = {
  summarizeHeuristics,
};
