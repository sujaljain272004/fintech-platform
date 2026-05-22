const palette = ["#14b8a6", "#2563eb", "#0f766e", "#ea580c", "#7c3aed", "#dc2626"];

const createWalletNumber = () =>
  `WL${Math.floor(100000000 + Math.random() * 900000000)}`;

const buildDisplayName = (fullName, phoneNumber) => {
  if (fullName && fullName.trim()) {
    return fullName.trim();
  }

  if (!phoneNumber) {
    return "FinLink User";
  }

  return `User ${phoneNumber.slice(-4)}`;
};

const pickAvatarColor = (seed = "") => {
  const code = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[code % palette.length];
};

module.exports = {
  createWalletNumber,
  buildDisplayName,
  pickAvatarColor,
};
