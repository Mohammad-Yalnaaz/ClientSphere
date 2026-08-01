'use strict';

/**
 * authorizeRole.middleware.js
 *
 * Role-Based Access Control (RBAC) guard middleware factory.
 *
 * Returns an Express middleware that checks whether the authenticated
 * User (attached to req.user by authenticate.middleware.js) holds one
 * of the permitted roles. If not, forwards a 403 AppError.
 *
 * This middleware MUST always be used AFTER authenticate middleware
 * in the route chain, because it depends on req.user being set.
 *
 * Implementation: Module 2 (Authentication).
 *
 * Usage (once Module 2 is implemented):
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
  return (req, res, next) => {
    // ── Module 2 implementation placeholder ────────────────────────────
    // This function will:
    // 1. Confirm req.user exists (authenticate must have run first).
    // 2. Check req.user.role is in the `roles` array.
    // 3. Call next() on success; next(AppError 403) on failure.
    // ──────────────────────────────────────────────────────────────────
    next(
      new AppError(
        'Role authorization middleware not yet implemented. (Module 2)',
        HTTP_STATUS.NOT_IMPLEMENTED
      )
    );
  };
}

module.exports = authorizeRole;
