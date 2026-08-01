'use strict';

/**
 * apiResponse.util.js
 *
 * Provides standardised response helper functions used by all
 * controllers to ensure a consistent JSON envelope across every
 * endpoint (SRS FR-ERROR-011).
 *
 * Response envelope shape:
 * {
 *   "success": true | false,
 *   "message": "Human-readable description",
 *   "data": { ... } | null,
 *   "errors": [ ... ] | undefined   (only on failure)
 *   "pagination": { ... } | undefined  (only on paginated lists)
 * }
 *
 * Design decisions:
 * - All success responses go through sendSuccess() so the shape never
 *   drifts between controllers.
 * - Pagination metadata is an optional top-level field rather than
 *   being embedded inside data, making it easier for API consumers
 *   to detect and handle paginated responses.
 * - Error responses are handled exclusively by the errorHandler
 *   middleware; these helpers are for success paths only.
 */

const HTTP_STATUS = require('../constants/httpStatusCodes.constants');

/**
 * Sends a successful JSON response.
 *
 * @param {import('express').Response} res    - Express response object.
 * @param {string}                    message - Human-readable success message.
 * @param {*}                         [data]  - Response payload (object, array, or null).
 * @param {number}                    [statusCode=200] - HTTP status code.
 * @param {object}                    [pagination]     - Optional pagination metadata.
 * @returns {void}
 */
function sendSuccess(res, message, data = null, statusCode = HTTP_STATUS.OK, pagination = null) {
  const body = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    body.pagination = pagination;
  }

  return res.status(statusCode).json(body);
}

/**
 * Sends a 201 Created response for resource creation operations.
 *
 * @param {import('express').Response} res     - Express response object.
 * @param {string}                    message  - Human-readable success message.
 * @param {*}                         [data]   - The created resource payload.
 * @returns {void}
 */
function sendCreated(res, message, data = null) {
  return sendSuccess(res, message, data, HTTP_STATUS.CREATED);
}

/**
 * Sends a 204 No Content response for operations that have no body
 * (e.g., delete, mark-as-read).
 *
 * @param {import('express').Response} res - Express response object.
 * @returns {void}
 */
function sendNoContent(res) {
  return res.status(HTTP_STATUS.NO_CONTENT).end();
}

module.exports = { sendSuccess, sendCreated, sendNoContent };
