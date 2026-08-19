'use strict';

/**
 * organizationScope.middleware.js
 *
 * Enforces organizational data isolation (SRS §6.3.3 and §6.4.2).
 *
 * After authenticate.middleware.js has resolved req.user, this
 * middleware extracts the Organization ID from req.user and attaches
 * it to req.organizationId. All repository queries for multi-tenant
 * resources MUST include this field as a mandatory filter, ensuring
 * that no operation can reach data belonging to another Organization.
 *
 * Design decisions:
 * - req.organizationId is a string (not an ObjectId) so that it can
 *   be safely compared and embedded in queries without extra .toString()
 *   calls throughout the codebase.
 * - This middleware must always run after authenticate middleware.
 * - A missing organizationId on req.user is treated as 403 Forbidden —
 *   an authenticated user without an organisation is an invalid system
 *   state per SRS Ch.3.
 */

const AppError = require('../utils/appError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constants');

/**
 * Organization scope middleware.
 */
const organizationScope = (req, _res, next) => {
  // Defensive check: authenticate middleware must have run first.
  if (!req.user) {
    return next(
      new AppError(
        'Authentication required. organizationScope must be used after authenticate.',
        HTTP_STATUS.UNAUTHORIZED
      )
    );
  }

  const orgId = req.user.organizationId;
  if (!orgId) {
    return next(
      new AppError(
        'Your account is not associated with an organization.',
        HTTP_STATUS.FORBIDDEN
      )
    );
  }

  // Attach as a string for convenient use in query filters.
  req.organizationId = orgId.toString();

  next();
};

module.exports = organizationScope;
