const AppError = require("../utils/AppError");
const { findUserWalletByPhone } = require("../services/userLifecycleService");
const { getBearerToken, verifyToken } = require("../services/tokenService");

const authenticate = async (req, res, next) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return next(
        new AppError("Authentication is required. Please sign in again.", 401)
      );
    }

    const payload = verifyToken(token, "access");
    const sessionAccount = await findUserWalletByPhone(payload.phoneNumber);

    if (!sessionAccount) {
      return next(new AppError("User session not found. Please sign in again.", 401));
    }

    const { user, wallet } = sessionAccount;
    if (String(user._id) !== String(payload.sub)) {
      return next(new AppError("Authentication token does not match this user.", 401));
    }

    req.appUser = user;
    req.appWallet = wallet;
    req.authToken = payload;

    return next();
  } catch (error) {
    return next(error.statusCode ? error : new AppError(error.message || "Unable to authenticate this user.", 401));
  }
};

module.exports = authenticate;
