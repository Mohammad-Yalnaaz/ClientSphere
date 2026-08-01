'use strict';

/**
 * appError.util.js
 *
 * Custom operational error class for ClientSphere.
 *
 * Design decisions:
 * - Extends the native Error so that instanceof checks, stack traces,
 *   and try/catch blocks all work as expected.
 * - isOperational: true distinguishes expected application errors
 *   (invalid input, not found, unauthorised) from unexpected crashes
 *   (programming bugs, infrastructure failures). The error handler
 *   middleware uses this flag to decide whether to expose the message
 *   to the client.
 * - statusCode is stored on the instance so the error handler can
 *   set the correct HTTP response status without inspecting the
 *   error type separately.
 * - errors array carries per-field validation failures produced by
 *   express-validator, enabling a single structured error envelope
 *   (SRS FR-ERROR-011).
 */

class AppError extends Error {
  /**
   * @param {string}   message    - Human-readable error message sent to the client.
   * @param {number}   statusCode - HTTP status code (e.g. 400, 401, 403, 404).
   * @param {Array}    [errors]   - Optional array of per-field validation error objects.
   */
  constructor(message, statusCode, errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    // Capture a clean stack trace that excludes this constructor frame.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
