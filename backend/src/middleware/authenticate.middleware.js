'use strict';

/**
 * authenticate.middleware.js
 *
 * Verifies the JWT access token present in the Authorization header
 * and attaches the resolved User document to req.user.
 *
 * This middleware is a required prerequisite for every protected route
 * in ClientSphere (SRS §6.2.1 — authentication before authorization).
 *
 * Implementation: Module 2 (Authentication).
 * The full implementation requires the User model and JWT utilities
 * which are introduced in Module 2. The interface is declared here
 * in Module 1 so that app.js and routes/index.js can import it
 * without circular dependency issues.
 *
 * Behaviour (once implemented):
 * - Reads the Bearer token from the Authorization header.
 * - Verifies the token using JWT_ACCESS_SECRET.
 * - Loads the User document from MongoDB and attaches it to req.user.
 * - Forwards a 401 AppError if the token is missing, malformed,
 *   expired, or if the associated User no longer exists.
 * - Forwards a 403 AppError if the User account is deactivated.
 */

const AppError = require('../utils/appError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constants');
const asyncHandler = require('../utils/asyncHandler.util');

/**
 * JWT authentication middleware.
 * Implemented in Module 2.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  // ── Module 2 implementation placeholder ─────────────────────────────
  // This function will:
  // 1. Extract the Bearer token from req.headers.authorization.
  // 2. Verify with jwt.verify(token, config.jwt.accessSecret).
  // 3. Load User from DB and confirm isActive === true.
  // 4. Attach the User document to req.user.
  // 5. Call next() on success; next(AppError) on failure.
  // ────────────────────────────────────────────────────────────────────
  next(
    new AppError(
      'Authentication middleware not yet implemented. (Module 2)',
      HTTP_STATUS.NOT_IMPLEMENTED
    )
  );
});

module.exports = authenticate;
