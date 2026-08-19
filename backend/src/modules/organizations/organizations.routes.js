'use strict';

/**
 * organizations.routes.js
 *
 * Route definitions for the Organizations module.
 *
 * All routes are scoped to the authenticated user's own Organization
 * using the /me convention — a user can only ever manage their own org.
 *
 * Route layout:
 *   GET    /me              – Get org profile          (all authenticated users)
 *   PATCH  /me              – Update org profile       (Administrator only)
 *   PATCH  /me/settings     – Update org settings      (Administrator only)
 *   PATCH  /me/deactivate   – Deactivate org           (Administrator only)
 *   PATCH  /me/reactivate   – Reactivate org           (Administrator only)
 *
 * Middleware chain for protected routes:
 *   authenticate → organizationScope → [authorizeRole] → validateRequest → controller
 */

const { Router } = require('express');

const authenticate = require('../../middleware/authenticate.middleware');
const authorizeRole = require('../../middleware/authorizeRole.middleware');
const organizationScope = require('../../middleware/organizationScope.middleware');
const validateRequest = require('../../middleware/validateRequest.middleware');
const { ROLES } = require('../../constants/roles.constants');

const orgController = require('./organizations.controller');
const { validateUpdateProfile, validateUpdateSettings } = require('./organizations.validation');

const router = Router();

// All organization routes require authentication and org scope.
router.use(authenticate, organizationScope);

// ── GET /me ───────────────────────────────────────────────────────────────────
// Any authenticated user in the org can view the org profile.
router.get('/me', orgController.getMyOrganization);

// ── PATCH /me ─────────────────────────────────────────────────────────────────
// Administrator only: update org name and/or logo.
router.patch(
  '/me',
  authorizeRole(ROLES.ADMINISTRATOR),
  validateUpdateProfile,
  validateRequest,
  orgController.updateMyOrganization
);

// ── PATCH /me/settings ────────────────────────────────────────────────────────
// Administrator only: merge-update org settings object.
router.patch(
  '/me/settings',
  authorizeRole(ROLES.ADMINISTRATOR),
  validateUpdateSettings,
  validateRequest,
  orgController.updateMyOrganizationSettings
);

// ── PATCH /me/deactivate ──────────────────────────────────────────────────────
// Administrator only: deactivate org (FR-ORG-006).
router.patch(
  '/me/deactivate',
  authorizeRole(ROLES.ADMINISTRATOR),
  orgController.deactivateMyOrganization
);

// ── PATCH /me/reactivate ──────────────────────────────────────────────────────
// Administrator only: reactivate org (FR-ORG-005).
router.patch(
  '/me/reactivate',
  authorizeRole(ROLES.ADMINISTRATOR),
  orgController.reactivateMyOrganization
);

module.exports = router;
