const AuthLog = require("../models/AuthLog");

const createAuthLog = async ({ user = null, phoneNumber, eventType, status = "info", req = null, metadata = {} }) => {
  if (!phoneNumber || !eventType) {
    return null;
  }

  return AuthLog.create({
    user: user?._id || user || null,
    phoneNumber,
    eventType,
    status,
    ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || "",
    userAgent: req?.headers?.["user-agent"] || "",
    metadata,
  });
};

module.exports = {
  createAuthLog,
};