'use strict';

/**
 * errorHandler.middleware.js
 *
 * Centralised Express error-handling middleware.
 * MUST be registered LAST in app.js — after all routes and other
 * middleware — to catch errors forwarded by next(err).
 *
 * Design decisions:
 * - Only AppError instances (isOperational: true) expose their message
 *   to the client. Unexpected errors (programming bugs, infra failures)
 *   return a generic "Internal server error" message in production to
 *   avoid leaking implementation details (SRS §6.5.4).
 * - Stack traces are included in development responses to aid debugging
 *   but are stripped in production.
 * - Mongoose-specific errors (ValidationError, CastError, duplicate key)
 *   are intercepted and converted to operational AppErrors with
 *   user-facing messages, per SRS FR-ERROR-011 and FR-ERROR-012.
 * - The `errors` array from express-validator failures is preserved in
 *   the response body for structured client-side form handling.
 */

const AppError = require('../utils/appError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constants');
const logger = require('../utils/logger.util');
const config = require('../config/env.config');

// ─── Mongoose error converters ────────────────────────────────────────────────

/**
 * Converts a Mongoose ValidationError into an operational AppError.
 * Collects all field-level messages into the errors array.
 *
 * @param {Error} err - Mongoose ValidationError instance.
 * @returns {AppError}
 */
function handleMongooseValidationError(err) {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError('Validation failed. Please check your input.', HTTP_STATUS.BAD_REQUEST, errors);
}

/**
 * Converts a Mongoose CastError (invalid ObjectId, wrong type) into
 * an operational AppError.
 *
 * @param {Error} err - Mongoose CastError instance.
 * @returns {AppError}
 */
function handleMongooseCastError(err) {
  return new AppError(
    `Invalid value '${err.value}' for field '${err.path}'.`,
    HTTP_STATUS.BAD_REQUEST
  );
}

/**
 * Converts a MongoDB duplicate key error (code 11000) into an
 * operational AppError with a meaningful field reference.
 *
 * @param {Error} err - MongoDB error with code 11000.
 * @returns {AppError}
 */
function handleDuplicateKeyError(err) {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  return new AppError(
    `A record with ${field} '${value}' already exists.`,
    HTTP_STATUS.CONFLICT
  );
}

// ─── Main error handler ───────────────────────────────────────────────────────

/**
 * Centralised error handler. Express identifies this as an error
 * handler because it accepts four parameters (err, req, res, next).
 *
 * @param {Error}                     err  - The error forwarded by next(err).
 * @param {import('express').Request} req  - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function (unused but required).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  // ── Convert known Mongoose / MongoDB errors to operational AppErrors ─
  if (err.name === 'ValidationError') {
    error = handleMongooseValidationError(err);
  } else if (err.name === 'CastError') {
    error = handleMongooseCastError(err);
  } else if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token.', HTTP_STATUS.UNAUTHORIZED);
  } else if (err.name === 'TokenExpiredError') {
    error = new AppError('Authentication token has expired.', HTTP_STATUS.UNAUTHORIZED);
  }

  // ── Determine status code ────────────────────────────────────────────
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // ── Log the error ────────────────────────────────────────────────────
  if (statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    logger.error(`[${req.method}] ${req.path} — ${error.message}`, {
      statusCode,
      stack: error.stack,
      requestId: req.id,
    });
  } else {
    logger.warn(`[${req.method}] ${req.path} — ${error.message}`, {
      statusCode,
      requestId: req.id,
    });
  }

  // ── Build the response body ──────────────────────────────────────────
  const isOperational = error.isOperational === true;

  const responseBody = {
    success: false,
    message: isOperational
      ? error.message
      : 'An unexpected error occurred. Please try again later.',
  };

  // Include per-field validation errors when present.
  if (isOperational && Array.isArray(error.errors) && error.errors.length > 0) {
    responseBody.errors = error.errors;
  }

  // Include stack trace only in development for debugging convenience.
  if (config.isDevelopment && !isOperational) {
    responseBody.stack = error.stack;
  }

  return res.status(statusCode).json(responseBody);
}

module.exports = errorHandler;
