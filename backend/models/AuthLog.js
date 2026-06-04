const mongoose = require("mongoose");

const authLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        "otp_sent",
        "otp_verified",
        "login_success",
        "login_failure",
        "logout",
        "session_restore",
        "admin_access",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failure", "info"],
      default: "info",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

authLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuthLog", authLogSchema);
