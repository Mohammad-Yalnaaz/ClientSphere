'use strict';

/**
 * users.routes.js
 *
 * Route definitions for the Users module.
 *
 * Route layout:
 *   GET    /              – List users in org           (Admin, Manager)
 *   POST   /              – Create user directly        (Administrator only)
 *   GET    /:id           – Get single user             (Admin, Manager)
 *   PATCH  /:id/profile   – Update user profile         (Admin, or own profile)
 *   PATCH  /:id/role      – Change user role            (Administrator only)
 *   PATCH  /:id/activate  – Activate user account       (Administrator only)
 *   PATCH  /:id/deactivate– Deactivate user account     (Administrator only)
 *   DELETE /:id           – Soft-remove user            (Administrator only)
 *
 * All routes require authentication + org scope.
 */

const { Router } = require('express');

const authenticate        = require('../../middleware/authenticate.middleware');
const authorizeRole       = require('../../middleware/authorizeRole.middleware');
const organizationScope   = require('../../middleware/organizationScope.middleware');
const validateRequest     = require('../../middleware/validateRequest.middleware');
const { ROLES }           = require('../../constants/roles.constants');

const userController = require('./users.controller');
const {
  validateCreateUser,
  validateUpdateProfile,
  validateChangeRole,
  validateListUsers,
} = require('./users.validation');

const router = Router();

// All user routes require authentication and org scope.
router.use(authenticate, organizationScope);

// ── GET / — List users ────────────────────────────────────────────────────────
router.get(
  '/',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  validateListUsers,
  validateRequest,
  userController.listUsers
);

// ── POST / — Create user directly ─────────────────────────────────────────────
router.post(
  '/',
  authorizeRole(ROLES.ADMINISTRATOR),
  validateCreateUser,
  validateRequest,
  userController.createUser
);

// ── GET /:id — Get single user ────────────────────────────────────────────────
router.get(
  '/:id',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  userController.getUserById
);

// ── PATCH /:id/profile — Update profile ───────────────────────────────────────
// Any authenticated user can update their own profile.
// Admins can update any user's profile (enforced in service).
router.patch(
  '/:id/profile',
  validateUpdateProfile,
  validateRequest,
  userController.updateUserProfile
);

// ── PATCH /:id/role — Change role ─────────────────────────────────────────────
router.patch(
  '/:id/role',
  authorizeRole(ROLES.ADMINISTRATOR),
  validateChangeRole,
  validateRequest,
  userController.changeUserRole
);

// ── PATCH /:id/activate — Activate account ────────────────────────────────────
router.patch(
  '/:id/activate',
  authorizeRole(ROLES.ADMINISTRATOR),
  userController.activateUser
);

// ── PATCH /:id/deactivate — Deactivate account ────────────────────────────────
router.patch(
  '/:id/deactivate',
  authorizeRole(ROLES.ADMINISTRATOR),
  userController.deactivateUser
);

// ── DELETE /:id — Soft-remove user ────────────────────────────────────────────
router.delete(
  '/:id',
  authorizeRole(ROLES.ADMINISTRATOR),
  userController.removeUser
);

module.exports = router;
