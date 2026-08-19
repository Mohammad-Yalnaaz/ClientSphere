'use strict';

/**
 * users.controller.js
 *
 * Thin HTTP adapter for User management endpoints.
 *
 * Architecture rule (ARCHITECTURE_DECISIONS.md §9):
 *  - No business logic — only extraction, delegation, and response.
 *  - req.organizationId set by organizationScope middleware.
 *  - req.user set by authenticate middleware.
 */

const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendNoContent } = require('../../utils/apiResponse.util');
const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');
const userService = require('./users.service');

// ── List Users ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/users
 * Returns paginated list of users in the organization.
 * Supports ?search=, ?role=, ?isActive=, ?page=, ?limit=
 */
const listUsers = asyncHandler(async (req, res) => {
  const { search, role, isActive, page, limit } = req.query;

  const result = await userService.listUsers(req.organizationId, {
    search, role, isActive, page, limit,
  });

  return sendSuccess(
    res,
    'Users retrieved successfully.',
    { users: result.users },
    HTTP_STATUS.OK,
    { total: result.total, page: result.page, limit: result.limit }
  );
});

// ── Get Single User ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/users/:id
 * Returns a single user's profile scoped to the org.
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id, req.organizationId);
  return sendSuccess(res, 'User retrieved successfully.', { user });
});

// ── Create User ────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/users
 * Directly creates a new user in the organization (Administrator only).
 */
const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const user = await userService.createUser(req.organizationId, {
    firstName, lastName, email, password, role,
  });

  return sendCreated(res, 'User created successfully.', { user });
});

// ── Update Own Profile / Admin updates any ────────────────────────────────────

/**
 * PATCH /api/v1/users/:id/profile
 * Updates a user's profile fields.
 * A user can update their own. Admins can update any user in the org.
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, avatarUrl } = req.body;

  const user = await userService.updateUserProfile(
    req.params.id,
    req.organizationId,
    { firstName, lastName, avatarUrl }
  );

  return sendSuccess(res, 'User profile updated successfully.', { user });
});

// ── Change Role ───────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/users/:id/role
 * Changes the role of a user (Administrator only).
 */
const changeUserRole = asyncHandler(async (req, res) => {
  const user = await userService.changeUserRole(
    req.params.id,
    req.organizationId,
    req.body.role
  );

  return sendSuccess(res, 'User role updated successfully.', { user });
});

// ── Activate User ─────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/users/:id/activate
 * Restores a deactivated user account (Administrator only).
 */
const activateUser = asyncHandler(async (req, res) => {
  const user = await userService.activateUser(req.params.id, req.organizationId);
  return sendSuccess(res, 'User account activated successfully.', { user });
});

// ── Deactivate User ───────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/users/:id/deactivate
 * Deactivates a user account (Administrator only).
 */
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await userService.deactivateUser(
    req.params.id,
    req.organizationId,
    req.user._id.toString()
  );

  return sendSuccess(res, 'User account deactivated successfully.', { user });
});

// ── Remove User ───────────────────────────────────────────────────────────────

/**
 * DELETE /api/v1/users/:id
 * Soft-removes a user from the organization (Administrator only).
 */
const removeUser = asyncHandler(async (req, res) => {
  await userService.removeUser(
    req.params.id,
    req.organizationId,
    req.user._id.toString()
  );

  return sendNoContent(res);
});

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUserProfile,
  changeUserRole,
  activateUser,
  deactivateUser,
  removeUser,
};
