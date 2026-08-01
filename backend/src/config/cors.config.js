'use strict';

/**
 * cors.config.js
 *
 * Builds and exports the CORS options object consumed by the `cors`
 * middleware in app.js.
 *
 * Key design decisions:
 * - credentials: true is REQUIRED because the application uses
 *   HttpOnly cookies to transmit the JWT refresh token
 *   (ARCHITECTURE_DECISIONS.md §4).
 * - Allowed origins are read from env.config so that dev and
 *   production environments can differ without code changes
 *   (ARCHITECTURE_DECISIONS.md §8).
 * - A dynamic origin callback is used instead of a static array so
 *   that same-origin requests (origin === undefined, e.g. Postman,
 *   server-to-server) are always permitted in development.
 */

const config = require('./env.config');
const logger = require('../utils/logger.util');

/**
 * Dynamic origin validator.
 * - Permits requests with no Origin header (non-browser clients).
 * - Permits any origin explicitly listed in CORS_ALLOWED_ORIGINS.
 * - Rejects all other origins with a clear CORS error.
 *
 * @param {string|undefined} origin - The request Origin header value.
 * @param {function} callback - CORS middleware callback (err, allow).
 */
function originValidator(origin, callback) {
  // Allow requests with no origin header (server-to-server, Postman, etc.)
  if (!origin) {
    return callback(null, true);
  }

  if (config.cors.allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  logger.warn(`[CORS] Blocked request from disallowed origin: ${origin}`);
  return callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
}

/**
 * CORS configuration object for use with the `cors` npm package.
 */
const corsOptions = {
  origin: originValidator,

  /**
   * credentials: true is mandatory — the browser will refuse to
   * expose the response (and won't send cookies) unless this is set,
   * which would break the HttpOnly refresh-token flow.
   */
  credentials: true,

  /**
   * Allowed HTTP methods. OPTIONS is required for preflight requests.
   */
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  /**
   * Headers the client is allowed to send. Content-Type and
   * Authorization cover all standard API usage; X-Request-ID
   * supports request tracing.
   */
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],

  /**
   * Headers the browser is permitted to expose to client-side
   * JavaScript. Useful for pagination metadata and rate-limit info.
   */
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],

  /**
   * Cache preflight responses for 10 minutes to reduce OPTIONS overhead.
   */
  maxAge: 600,
};

module.exports = corsOptions;
