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
 * Behaviour:
 * - Reads the Bearer token from the Authorization header.
 * - Verifies the token using JWT_ACCESS_SECRET via auth.service.
 * - Loads the User document from MongoDB (via users.repository).
 * - Confirms the user is still active and the token was not issued before
 *   a password change (rotation invalidation).
 * - Attaches the full User document to req.user.
 * - Forwards a 401 AppError if the token is missing, malformed,
 *   expired, or if the associated User no longer exists or is deactivated.
 */

const AppError = require('../utils/appError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constants');
const asyncHandler = require('../utils/asyncHandler.util');
const authService = require('../modules/auth/auth.service');
const userRepo = require('../modules/users/users.repository');

/**
 * JWT authentication middleware.
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  // 1. Extract the Bearer token from the Authorization header.
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError(
        'Authentication required. Please provide a valid Bearer token.',
        HTTP_STATUS.UNAUTHORIZED
      )
    );
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(
      new AppError('Authentication token is missing.', HTTP_STATUS.UNAUTHORIZED)
    );
  }

  // 2. Verify the access token (throws AppError on failure).
  const decoded = authService.verifyAccessToken(token);

  // 3. Load the User document and verify the account is still active.
  const user = await userRepo.findUserById(decoded.sub, '+passwordChangedAt');
  if (!user) {
    return next(
      new AppError(
        'The user associated with this token no longer exists.',
        HTTP_STATUS.UNAUTHORIZED
      )
    );
  }

  // 4. Check account activation status.
  if (!user.isActive) {
    return next(
      new AppError(
        'Your account has been deactivated. Please contact your administrator.',
        HTTP_STATUS.UNAUTHORIZED
      )
    );
  }

  // 5. Check if the password was changed after the token was issued.
  //    iat (issued-at) from the decoded payload is in seconds.
  if (user.isTokenIssuedBeforePasswordChange(decoded.iat)) {
    return next(
      new AppError(
        'Your password was recently changed. Please log in again.',
        HTTP_STATUS.UNAUTHORIZED
      )
    );
  }

  // 6. Attach the User document to the request for downstream middleware.
  req.user = user;

  next();
});

module.exports = authenticate;
