const AppError = require("../utils/AppError");
const { findUserWalletByPhone } = require("../services/userLifecycleService");
const { normalizePhoneNumber } = require("../utils/phone");

const authenticate = async (req, res, next) => {
  try {
    const phoneNumber = normalizePhoneNumber(req.headers["x-user-phone"] || "");

    if (!phoneNumber) {
      return next(
        new AppError("Authentication is required. Please sign in with your phone number.", 401)
      );
    }

    const sessionAccount = await findUserWalletByPhone(phoneNumber);

    if (!sessionAccount) {
      return next(new AppError("User session not found. Please sign in again.", 401));
    }

    const { user, wallet } = sessionAccount;
    req.appUser = user;
    req.appWallet = wallet;

    return next();
  } catch (error) {
    return next(new AppError(error.message || "Unable to authenticate this user.", 401));
  }
};

module.exports = authenticate;
