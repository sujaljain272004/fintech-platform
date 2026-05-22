const crypto = require("crypto");
const Transaction = require("../models/Transaction");

const hashValue = (payload) =>
  crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");

const buildLedgerEntry = async (payload, session = null) => {
  const latestTransaction = await Transaction.findOne({
    "blockchain.index": { $exists: true },
  })
    .sort({ "blockchain.index": -1 })
    .session(session)
    .lean();

  const previousHash = latestTransaction?.blockchain?.hash || "GENESIS";
  const index = (latestTransaction?.blockchain?.index || 0) + 1;
  const timestamp = new Date().toISOString();
  const payloadHash = hashValue(payload);
  const hash = hashValue({
    index,
    previousHash,
    payloadHash,
    timestamp,
    protocol: "finlink-ledger-v1",
  });

  return {
    index,
    previousHash,
    payloadHash,
    hash,
    timestamp,
    protocol: "finlink-ledger-v1",
    verifiedAt: new Date(),
  };
};

const verifyLedgerEntry = (transaction) => {
  const { blockchain } = transaction;
  if (!blockchain) {
    return false;
  }

  const recreatedHash = hashValue({
    index: blockchain.index,
    previousHash: blockchain.previousHash,
    payloadHash: blockchain.payloadHash,
    timestamp: blockchain.timestamp,
    protocol: blockchain.protocol,
  });

  return recreatedHash === blockchain.hash;
};

module.exports = {
  buildLedgerEntry,
  verifyLedgerEntry,
};
