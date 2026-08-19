'use strict';

/**
 * authorizeRole.middleware.js
 *
 * Role-Based Access Control (RBAC) guard middleware factory.
 *
 * Returns an Express middleware that checks whether the authenticated
 * User (attached to req.user by authenticate.middleware.js) holds one
 * of the permitted roles. If not, forwards a 403 Forbidden AppError.
 *
 * This middleware MUST always be used AFTER authenticate middleware
 * in the route chain, because it depends on req.user being set.
 *
 * Usage:
 *   router.post(
 *     '/projects',
 *     authenticate,
 *     authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
 *     asyncHandler(projectController.createProject)
 *   );
 *
 * @param {...string} roles - One or more role strings from roles.constants.js.
 * @returns {import('express').RequestHandler} Express middleware function.
 */

const AppError = require('../utils/appError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constants');

function authorizeRole(...roles) {
  return (req, _res, next) => {
    // Defensive check: authenticate middleware must have run first.
    if (!req.user) {
      return next(
        new AppError(
          'Authentication required. authorizeRole must be used after authenticate.',
          HTTP_STATUS.UNAUTHORIZED
        )
      );
    }

    // Check whether the user's role is in the permitted set.
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `You do not have permission to perform this action. Required role: ${roles.join(' or ')}.`,
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    next();
  };
}

module.exports = authorizeRole;
