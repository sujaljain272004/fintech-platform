const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return next(
    new AppError("Validation failed.", 422, errors.array({ onlyFirstError: true }))
  );
};
