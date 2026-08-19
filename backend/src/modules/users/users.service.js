'use strict';

/**
 * users.service.js
 *
 * Business logic for all User management operations.
 *
 * Responsibilities:
 *  - List users within an organization (with search + filter).
 *  - Get a single user's profile.
 *  - Create a user directly (FR-USER-002).
 *  - Update a user's own profile, or admin updates any user (FR-USER-003).
 *  - Change a user's role (FR-USER-004).
 *  - Activate / deactivate a user account (FR-USER-005, FR-USER-006).
 *  - Remove a user via soft-delete (FR-USER-007).
 *
 * Architecture (ARCHITECTURE_DECISIONS.md §9):
 *  - Calls repositories only — never Mongoose models directly.
 *  - Throws AppError for all operational failures.
 *  - No req / res / next — those are controller concerns.
 *
 * Organization isolation (FR-USER-012, FR-ORG-008):
 *  - Every operation filters by organizationId — users from other
 *    organizations are never reachable through this service.
 *
 * Note on FR-USER-001 (Invite User):
 *  - Full email-based invitation with token flow requires a mailer
 *    (nodemailer) and is deferred to a later phase. For now,
 *    direct user creation (FR-USER-002) covers provisioning needs.
 *
 * Note on FR-USER-014 (Audit Logging):
 *  - Activity logging will be added in Module 12.
 */

const AppError = require('../../utils/appError.util');
const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');
const logger = require('../../utils/logger.util');
const { ROLES } = require('../../constants/roles.constants');

const userRepo = require('./users.repository');
const orgRepo = require('../organizations/organizations.repository');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Verifies an organization exists and is active.
 * Used before any write operation that adds to an org.
 *
 * @param {string} organizationId
 * @throws {AppError} 404 or 403 if not found / inactive.
 */
async function assertActiveOrganization(organizationId) {
  const org = await orgRepo.findOrganizationById(organizationId);
  if (!org) {
    throw new AppError('Organization not found.', HTTP_STATUS.NOT_FOUND);
  }
  if (!org.isActive) {
    throw new AppError(
      'This organization is deactivated.',
      HTTP_STATUS.FORBIDDEN
    );
  }
}

/**
 * Ensures a role change does not leave the org without any administrator.
 * (FR-ORG-007)
 *
 * @param {string} organizationId
 * @param {import('mongoose').Document} targetUser - The user being changed.
 * @param {string} newRole - The role being assigned.
 * @throws {AppError} 422 if the operation would leave zero admins.
 */
async function assertAdminCountSafe(organizationId, targetUser, newRole) {
  if (targetUser.role === ROLES.ADMINISTRATOR && newRole !== ROLES.ADMINISTRATOR) {
    const adminCount = await userRepo.countAdminsByOrg(organizationId);
    if (adminCount <= 1) {
      throw new AppError(
        'Cannot change role: this is the last Administrator in the organization. Assign another Administrator first.',
        HTTP_STATUS.UNPROCESSABLE_ENTITY
      );
    }
  }
}

// ── Public service methods ─────────────────────────────────────────────────────

/**
 * Lists all users within an organization.
 * Supports optional search (by name/email) and filtering (by role, isActive).
 * (FR-USER-008, FR-USER-009, FR-USER-010)
 *
 * @param {string} organizationId
 * @param {object} query
 * @param {string}  [query.search]   - Search string matched against name/email.
 * @param {string}  [query.role]     - Filter by role.
 * @param {boolean} [query.isActive] - Filter by active status.
 * @param {number}  [query.page=1]
 * @param {number}  [query.limit=20]
 * @returns {Promise<{ users: object[], total: number, page: number, limit: number }>}
 */
async function listUsers(organizationId, query = {}) {
  const { search, role, isActive, page = 1, limit = 20 } = query;

  const filter = { organizationId };

  // Role filter
  if (role && Object.values(ROLES).includes(role)) {
    filter.role = role;
  }

  // Active status filter
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true' || isActive === true;
  }

  // Search by name or email (case-insensitive)
  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const User = require('./users.model');
  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map(u => u.toJSON()),
    total,
    page: Number(page),
    limit: Number(limit),
  };
}

/**
 * Gets a single user by ID, scoped to the organization.
 * (FR-USER-008)
 *
 * @param {string} userId
 * @param {string} organizationId
 * @returns {Promise<object>} User as plain JSON.
 * @throws {AppError} 404 if not found or belongs to a different org.
 */
async function getUserById(userId, organizationId) {
  const user = await userRepo.findUser({ _id: userId, organizationId });
  if (!user) {
    throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
  }
  return user.toJSON();
}

/**
 * Creates a new user directly within an organization.
 * (FR-USER-002)
 *
 * @param {string} organizationId
 * @param {object} data
 * @param {string} data.firstName
 * @param {string} data.lastName
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.role
 * @returns {Promise<object>} Created user as plain JSON.
 * @throws {AppError} 409 on duplicate email within org.
 */
async function createUser(organizationId, data) {
  await assertActiveOrganization(organizationId);

  const normalizedEmail = data.email.toLowerCase().trim();

  // Check for duplicate email within this organization.
  const existing = await userRepo.findUserByEmailAndOrg(normalizedEmail, organizationId);
  if (existing) {
    throw new AppError(
      'A user with this email address already exists in the organization.',
      HTTP_STATUS.CONFLICT
    );
  }

  const user = await userRepo.createUser({
    organizationId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: normalizedEmail,
    password: data.password,
    role: data.role || ROLES.EMPLOYEE,
    isActive: true,
  });

  logger.info(`User created: ${user.email} (${user._id}) in org ${organizationId}`);

  return user.toJSON();
}

/**
 * Updates a user's own profile, or an admin updates any user's profile.
 * Only firstName, lastName, avatarUrl are updatable here.
 * Role and status changes go through their own dedicated operations.
 * (FR-USER-003)
 *
 * @param {string} userId        - Target user's ID.
 * @param {string} organizationId
 * @param {object} updates
 * @param {string} [updates.firstName]
 * @param {string} [updates.lastName]
 * @param {string} [updates.avatarUrl]
 * @returns {Promise<object>} Updated user as plain JSON.
 * @throws {AppError} 404 if user not found in org.
 */
async function updateUserProfile(userId, organizationId, updates) {
  const allowedFields = {};

  if (updates.firstName !== undefined) allowedFields.firstName = updates.firstName.trim();
  if (updates.lastName !== undefined)  allowedFields.lastName  = updates.lastName.trim();
  if (updates.avatarUrl !== undefined) allowedFields.avatarUrl = updates.avatarUrl;

  const user = await userRepo.updateUserById(userId, allowedFields);
  if (!user || user.organizationId.toString() !== organizationId) {
    throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
  }

  logger.info(`User profile updated: ${user._id}`);

  return user.toJSON();
}

/**
 * Changes a user's role within their organization.
 * Enforces FR-ORG-007: cannot leave org without an administrator.
 * (FR-USER-004)
 *
 * @param {string} targetUserId
 * @param {string} organizationId
 * @param {string} newRole
 * @returns {Promise<object>} Updated user as plain JSON.
 * @throws {AppError} 404, 409, or 422.
 */
async function changeUserRole(targetUserId, organizationId, newRole) {
  const targetUser = await userRepo.findUser({ _id: targetUserId, organizationId });
  if (!targetUser) {
    throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (targetUser.role === newRole) {
    throw new AppError(
      `User already has the ${newRole} role.`,
      HTTP_STATUS.CONFLICT
    );
  }

  // Guard: ensure at least one admin remains.
  await assertAdminCountSafe(organizationId, targetUser, newRole);

  const updated = await userRepo.updateUserById(targetUserId, { role: newRole });

  logger.info(`User role changed: ${targetUserId} → ${newRole} in org ${organizationId}`);

  return updated.toJSON();
}

/**
 * Activates a previously deactivated user account.
 * (FR-USER-005)
 *
 * @param {string} targetUserId
 * @param {string} organizationId
 * @returns {Promise<object>} Updated user as plain JSON.
 * @throws {AppError} 404 or 409.
 */
async function activateUser(targetUserId, organizationId) {
  const user = await userRepo.findUser({ _id: targetUserId, organizationId });
  if (!user) {
    throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (user.isActive) {
    throw new AppError('User account is already active.', HTTP_STATUS.CONFLICT);
  }

  const updated = await userRepo.updateUserById(targetUserId, { isActive: true });

  logger.info(`User activated: ${targetUserId} in org ${organizationId}`);

  return updated.toJSON();
}

/**
 * Deactivates a user account — revokes login access but preserves all data.
 * (FR-USER-006)
 *
 * Cannot deactivate the last active administrator (FR-ORG-007).
 *
 * @param {string} targetUserId
 * @param {string} organizationId
 * @param {string} requestingUserId - Cannot deactivate themselves.
 * @returns {Promise<object>} Updated user as plain JSON.
 * @throws {AppError} 400, 404, 409, or 422.
 */
async function deactivateUser(targetUserId, organizationId, requestingUserId) {
  if (targetUserId === requestingUserId) {
    throw new AppError(
      'You cannot deactivate your own account.',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const user = await userRepo.findUser({ _id: targetUserId, organizationId });
  if (!user) {
    throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (!user.isActive) {
    throw new AppError('User account is already deactivated.', HTTP_STATUS.CONFLICT);
  }

  // Guard: cannot deactivate the last admin.
  if (user.role === ROLES.ADMINISTRATOR) {
    const adminCount = await userRepo.countAdminsByOrg(organizationId);
    if (adminCount <= 1) {
      throw new AppError(
        'Cannot deactivate the last Administrator in the organization.',
        HTTP_STATUS.UNPROCESSABLE_ENTITY
      );
    }
  }

  // Invalidate any active refresh tokens on deactivation.
  const updated = await userRepo.updateUserById(targetUserId, {
    isActive: false,
    refreshToken: null,
  });

  logger.warn(`User deactivated: ${targetUserId} in org ${organizationId}`);

  return updated.toJSON();
}

/**
 * Soft-removes a user from active participation in the organization.
 * Marks them as inactive and clears identifying data while preserving
 * historical attributions (task assignments, comments, activity logs).
 * (FR-USER-007)
 *
 * Cannot remove the last administrator.
 *
 * @param {string} targetUserId
 * @param {string} organizationId
 * @param {string} requestingUserId
 * @returns {Promise<void>}
 * @throws {AppError} 400, 404, or 422.
 */
async function removeUser(targetUserId, organizationId, requestingUserId) {
  if (targetUserId === requestingUserId) {
    throw new AppError(
      'You cannot remove your own account.',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const user = await userRepo.findUser({ _id: targetUserId, organizationId });
  if (!user) {
    throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
  }

  // Guard: cannot remove the last admin.
  if (user.role === ROLES.ADMINISTRATOR) {
    const adminCount = await userRepo.countAdminsByOrg(organizationId);
    if (adminCount <= 1) {
      throw new AppError(
        'Cannot remove the last Administrator in the organization.',
        HTTP_STATUS.UNPROCESSABLE_ENTITY
      );
    }
  }

  // Soft-remove: deactivate and invalidate tokens.
  await userRepo.updateUserById(targetUserId, {
    isActive: false,
    refreshToken: null,
  });

  logger.warn(`User soft-removed: ${targetUserId} from org ${organizationId}`);
}

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
