'use strict';

/**
 * validateRequest.middleware.js
 *
 * Collects express-validator results and converts any validation
 * failures into a structured 400 AppError with per-field details.
 *
 * Usage:
 *   router.post(
 *     '/resource',
 *     [...express-validator chains...],
 *     validateRequest,
 *     asyncHandler(controller.create)
 *   );
 *
 * Design decisions:
 * - Runs AFTER all express-validator chain middleware so that all
 *   field-level errors are collected in a single pass rather than
 *   failing on the first error.
 * - Normalises each error into { field, message } shape so that the
 *   client-side form handling can map directly to field names.
 * - Forwards a single AppError with the full errors array to the
 *   centralised error handler (SRS FR-ERROR-011).
 */

const { validationResult } = require('express-validator');
const AppError = require('../utils/appError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constants');

/**
 * Express middleware that inspects accumulated express-validator
 * results and either calls next() (no errors) or forwards a
 * 400 AppError with all field-level failures.
 *
 * @param {import('express').Request}      req  - Express request object.
 * @param {import('express').Response}     res  - Express response object (unused).
 * @param {import('express').NextFunction}  next - Express next function.
 */
function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((err) => ({
    field: err.path || err.param || 'unknown',
    message: err.msg,
  }));

  return next(
    new AppError(
      'Validation failed. Please check your input and try again.',
      HTTP_STATUS.BAD_REQUEST,
      errors
    )
  );
}

module.exports = validateRequest;
