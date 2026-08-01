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
 * Implementation: Module 2 (Authentication).
 * Declared in Module 1 so the correct interface is available
 * for import throughout the application before Module 2 ships.
 *
 * Design decisions:
 * - Attaching organizationId to req (rather than re-reading from
 *   req.user.organizationId at each repository call) provides a
 *   single, trusted, request-scoped value. All modules read from
 *   req.organizationId — never from req.user.organizationId directly —
 *   so that scope enforcement is consistent regardless of how the
 *   User document structure evolves.
 * - A missing organizationId is treated as a 403 Forbidden rather
 *   than a 500 error, because a User without an organisation is a
 *   known-invalid state in this system (every User belongs to exactly
 *   one Organisation per SRS Ch.3).
 */

const AppError = require('../utils/appError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constants');
const asyncHandler = require('../utils/asyncHandler.util');

/**
 * Organization scope middleware.
 * Implemented in Module 2.
 */
const organizationScope = asyncHandler(async (req, res, next) => {
  // ── Module 2 implementation placeholder ─────────────────────────────
  // This function will:
  // 1. Read req.user.organizationId (set by authenticate middleware).
  // 2. Attach req.organizationId = req.user.organizationId.toString().
  // 3. Call next() on success; next(AppError 403) if value is missing.
  // ────────────────────────────────────────────────────────────────────
  next(
    new AppError(
      'Organization scope middleware not yet implemented. (Module 2)',
      HTTP_STATUS.NOT_IMPLEMENTED
    )
  );
});

module.exports = organizationScope;
