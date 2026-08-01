'use strict';

/**
 * notFound.middleware.js
 *
 * Catches any request that reaches this middleware without having
 * been matched by a registered route and forwards a structured
 * 404 AppError to the error handler.
 *
 * Must be registered AFTER all route registrations and BEFORE
 * the errorHandler in app.js.
 *
 * Design decisions:
 * - Converts unmatched routes into operational AppErrors so that
 *   the centralised error handler formats the response consistently
 *   with all other errors (SRS FR-ERROR-011).
 * - The message includes the attempted URL so clients can quickly
 *   identify mis-typed or stale endpoint paths.
 */

const AppError = require('../utils/appError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constants');

/**
 * Not-found middleware.
 *
 * @param {import('express').Request}      req  - Express request object.
 * @param {import('express').Response}     res  - Express response object (unused).
 * @param {import('express').NextFunction}  next - Express next function.
 */
function notFound(req, res, next) {
  next(
    new AppError(
      `The requested resource was not found: ${req.method} ${req.originalUrl}`,
      HTTP_STATUS.NOT_FOUND
    )
  );
}

module.exports = notFound;
