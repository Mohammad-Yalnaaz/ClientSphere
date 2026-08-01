'use strict';

/**
 * rateLimiter.middleware.js
 *
 * Named rate limiters for sensitive endpoints, as required by
 * ARCHITECTURE_DECISIONS.md §7.
 *
 * Design decisions:
 * - Separate limiters with distinct windows and ceilings for each
 *   sensitive operation (login, password reset, invitation, AI).
 *   A single global limiter is too coarse to protect these endpoints
 *   without throttling normal API traffic.
 * - The memory store (default) is used here. For a multi-instance
 *   production deployment behind a load balancer, this should be
 *   replaced with a Redis store (e.g., rate-limit-redis) so that
 *   counts are shared across instances. Flagged for Module infra upgrade.
 * - standardApiLimiter provides a broad safety net for all other
 *   routes; it is applied globally in app.js.
 * - All limiters use a consistent JSON error shape via handler so
 *   that API clients receive the same envelope as other errors.
 * - No CAPTCHA is used (ARCHITECTURE_DECISIONS.md §7).
 */

const rateLimit = require('express-rate-limit');
const HTTP_STATUS = require('../constants/httpStatusCodes.constants');

/**
 * Builds a reusable rate limit error response handler that matches
 * the application's standard error envelope.
 *
 * @param {string} message - Error message to surface to the client.
 * @returns {Function} express-rate-limit `handler` option function.
 */
function buildHandler(message) {
  return (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message,
    });
  };
}

/**
 * Broad safety net for all API routes.
 * 100 requests per 15-minute window per IP.
 * Applied globally in app.js before route registration.
 */
const standardApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  handler: buildHandler(
    'Too many requests from this IP address. Please wait 15 minutes before trying again.'
  ),
});

/**
 * Login endpoint limiter (FR-AUTH-018).
 * 10 attempts per 15-minute window per IP.
 * Tight ceiling prevents credential stuffing.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildHandler(
    'Too many login attempts from this IP address. Please wait 15 minutes before trying again.'
  ),
});

/**
 * Password-reset request limiter.
 * 5 requests per 60-minute window per IP.
 * Prevents email flooding against arbitrary accounts.
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildHandler(
    'Too many password-reset requests from this IP address. Please wait 60 minutes before trying again.'
  ),
});

/**
 * Invitation endpoint limiter.
 * 20 invitations per 60-minute window per IP.
 * Prevents bulk invitation spam.
 */
const invitationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildHandler(
    'Too many invitation requests. Please wait before sending more invitations.'
  ),
});

/**
 * AI endpoints limiter.
 * 30 AI-assisted requests per 60-minute window per IP.
 * Prevents excessive Gemini API usage and cost overruns.
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildHandler(
    'You have reached the AI request limit. Please wait before making more AI-assisted requests.'
  ),
});

module.exports = {
  standardApiLimiter,
  loginLimiter,
  passwordResetLimiter,
  invitationLimiter,
  aiLimiter,
};
