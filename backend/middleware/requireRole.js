const AppError = require("../utils/AppError");

const requireRole = (allowedRoles = []) => (req, res, next) => {
  const role = req.appUser?.role || "USER";

  if (!allowedRoles.includes(role)) {
    return next(new AppError("You do not have permission to access this resource.", 403));
  }

  return next();
};

module.exports = requireRole;