const CATEGORY_KEYWORDS = [
  { name: "Food", keywords: ["food", "grocery", "restaurant", "meal", "dine", "cafe", "swiggy", "zomato"] },
  { name: "Travel", keywords: ["travel", "trip", "bus", "train", "flight", "taxi", "uber", "ola", "metro"] },
  { name: "Shopping", keywords: ["shop", "shopping", "mall", "amazon", "flipkart", "market"] },
  { name: "Bills", keywords: ["bill", "electric", "water", "rent", "utility", "mobile", "recharge"] },
  { name: "Entertainment", keywords: ["movie", "cinema", "game", "music", "netflix", "subscription", "fun"] },
  { name: "Healthcare", keywords: ["hospital", "doctor", "pharmacy", "medicine", "clinic", "health"] },
  { name: "Education", keywords: ["school", "college", "course", "tuition", "book", "education"] },
];

const normalizeText = (value = "") => String(value).toLowerCase();

const classifyCategory = (transaction) => {
  const searchableText = normalizeText(
    [transaction.note, transaction.reference, transaction.counterpartyName].filter(Boolean).join(" ")
  );

  for (const category of CATEGORY_KEYWORDS) {
    if (category.keywords.some((keyword) => searchableText.includes(keyword))) {
      return category.name;
    }
  }

  return "Others";
};

const buildMonthlyTrend = (transactions = [], months = 6) => {
  const today = new Date();
  const buckets = [];

  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - index, 1);
    buckets.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-IN", { month: "short" }),
      sent: 0,
      received: 0,
    });
  }

  transactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.find((entry) => entry.key === key);

    if (!bucket) {
      return;
    }

    const amount = Number(transaction.amount || 0);
    if (transaction.direction === "sent") {
      bucket.sent += amount;
    } else {
      bucket.received += amount;
    }
  });

  return buckets.map(({ key, ...entry }) => ({
    ...entry,
    net: Math.max(entry.received - entry.sent, 0),
  }));
};

const buildCategoryBreakdown = (transactions = []) => {
  const categoryMap = new Map([
    ["Food", 0],
    ["Travel", 0],
    ["Shopping", 0],
    ["Bills", 0],
    ["Entertainment", 0],
    ["Healthcare", 0],
    ["Education", 0],
    ["Others", 0],
  ]);

  transactions
    .filter((transaction) => transaction.direction === "sent")
    .forEach((transaction) => {
      const category = classifyCategory(transaction);
      categoryMap.set(category, (categoryMap.get(category) || 0) + Number(transaction.amount || 0));
    });

  const total = Array.from(categoryMap.values()).reduce((sum, value) => sum + value, 0) || 1;

  return Array.from(categoryMap.entries())
    .filter(([, amount]) => amount > 0)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: Math.round((amount / total) * 100),
    }));
};

const buildFinancialHealthScore = ({ wallet, transactions = [] }) => {
  const sentTotal = transactions.filter((transaction) => transaction.direction === "sent").reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const receivedTotal = transactions.filter((transaction) => transaction.direction === "received").reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const activeMonths = new Set(transactions.map((transaction) => new Date(transaction.createdAt).getMonth())).size || 1;
  const balanceScore = Math.min(Math.round((Number(wallet?.balance || 0) / 1000) * 20), 25);
  const flowScore = receivedTotal >= sentTotal ? 25 : Math.max(10, Math.round((receivedTotal / Math.max(sentTotal, 1)) * 25));
  const activityScore = Math.min(activeMonths * 8, 20);
  const consistencyScore = transactions.length >= 6 ? 15 : transactions.length >= 3 ? 10 : 5;
  const cautionPenalty = sentTotal > receivedTotal * 1.25 ? 10 : 0;

  return Math.max(30, Math.min(100, balanceScore + flowScore + activityScore + consistencyScore - cautionPenalty));
};

const buildInsightAnalytics = ({ wallet, transactions = [] }) => {
  const monthlyTrend = buildMonthlyTrend(transactions, 6);
  const categoryBreakdown = buildCategoryBreakdown(transactions);
  const sentTotal = transactions.filter((transaction) => transaction.direction === "sent").reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const receivedTotal = transactions.filter((transaction) => transaction.direction === "received").reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const financialHealthScore = buildFinancialHealthScore({ wallet, transactions });

  const monthlySavingsEstimate = Math.max(Math.round((receivedTotal - sentTotal) * 0.2), 0);
  const warnings = [];

  if (sentTotal > receivedTotal) {
    warnings.push("Spending is higher than inflows in the current activity window.");
  }
  if (categoryBreakdown[0]?.percentage >= 35) {
    warnings.push(`High spend concentration in ${categoryBreakdown[0].name}.`);
  }
  if (Number(wallet?.balance || 0) < 100) {
    warnings.push("Wallet balance is running low.");
  }

  const recommendations = [
    "Review your largest expense category first and trim one recurring cost.",
    "Keep at least 20% of incoming funds aside as a savings buffer when possible.",
    "Send money after confirming the recipient to avoid transfer reversals.",
  ];

  return {
    monthlyTrend,
    categoryBreakdown,
    monthlySavingsEstimate,
    warnings,
    recommendations,
    financialHealthScore,
  };
};

module.exports = {
  classifyCategory,
  buildMonthlyTrend,
  buildCategoryBreakdown,
  buildFinancialHealthScore,
  buildInsightAnalytics,
};