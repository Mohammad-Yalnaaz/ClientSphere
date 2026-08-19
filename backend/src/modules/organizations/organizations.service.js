'use strict';

/**
 * organizations.service.js
 *
 * Business logic for all Organization management operations.
 *
 * Responsibilities:
 *  - Retrieve the current user's Organization profile.
 *  - Update Organization profile information (name, logoUrl).
 *  - Update Organization-level settings.
 *  - Deactivate an Organization (FR-ORG-006).
 *
 * Architecture (ARCHITECTURE_DECISIONS.md §9):
 *  - Calls repositories only — never Mongoose models directly.
 *  - Throws AppError for all operational failures.
 *  - No req / res / next — those are controller concerns.
 *
 * Scope rules (SRS §3.2.3, FR-ORG-008):
 *  - Every operation is scoped to the authenticated user's Organization.
 *  - No cross-organization access is possible through this service.
 *
 * Note on FR-ORG-001 (Organization Creation):
 *  - Organization creation is handled by auth.service.register() as part
 *    of the registration flow. It is not exposed as a separate operation
 *    here because organizations are created once, at registration time,
 *    and are not user-creatable after that point.
 *
 * Note on FR-ORG-011 (Audit Logging):
 *  - Activity logging will be added in Module 12. Methods here are
 *    structured to make that addition straightforward.
 */

const AppError = require('../../utils/appError.util');
const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');
const logger = require('../../utils/logger.util');

const orgRepo = require('./organizations.repository');
const userRepo = require('../users/users.repository');
const { ROLES } = require('../../constants/roles.constants');

// ── Public service methods ─────────────────────────────────────────────────────

/**
 * Returns the Organization profile for the requesting user's organization.
 * (FR-ORG-002 — read side)
 *
 * @param {string} organizationId - From req.organizationId (set by organizationScope middleware).
 * @returns {Promise<object>} The Organization document as plain JSON.
 * @throws {AppError} 404 if the organization is not found.
 */
async function getOrganization(organizationId) {
  const organization = await orgRepo.findOrganizationById(organizationId);

  if (!organization) {
    throw new AppError('Organization not found.', HTTP_STATUS.NOT_FOUND);
  }

  return organization.toJSON();
}

/**
 * Updates the Organization's profile fields (name, logoUrl).
 * Restricted to Administrator role — enforced at the route level via authorizeRole.
 * (FR-ORG-002, FR-ORG-004)
 *
 * @param {string} organizationId
 * @param {object} updates
 * @param {string} [updates.name]    - New organization name.
 * @param {string} [updates.logoUrl] - New logo URL.
 * @returns {Promise<object>} The updated Organization as plain JSON.
 * @throws {AppError} 404 if not found.
 */
async function updateOrganizationProfile(organizationId, updates) {
  const allowedFields = {};

  if (updates.name !== undefined) {
    allowedFields.name = updates.name.trim();
  }

  if (updates.logoUrl !== undefined) {
    allowedFields.logoUrl = updates.logoUrl;
  }

  const organization = await orgRepo.updateOrganizationById(organizationId, allowedFields);

  if (!organization) {
    throw new AppError('Organization not found.', HTTP_STATUS.NOT_FOUND);
  }

  logger.info(`Organization profile updated: ${organization._id}`);

  return organization.toJSON();
}

/**
 * Updates Organization-level settings.
 * Settings are stored as a flexible Mixed field to support future expansion.
 * This operation MERGES the incoming settings into the existing ones — it
 * does not replace the entire settings object.
 * (FR-ORG-003, FR-ORG-009)
 *
 * @param {string} organizationId
 * @param {object} newSettings - Key-value pairs to merge into settings.
 * @returns {Promise<object>} The updated Organization as plain JSON.
 * @throws {AppError} 404 if not found.
 */
async function updateOrganizationSettings(organizationId, newSettings) {
  // Load current organization to perform a merge.
  const current = await orgRepo.findOrganizationById(organizationId);
  if (!current) {
    throw new AppError('Organization not found.', HTTP_STATUS.NOT_FOUND);
  }

  // Merge new settings over the existing ones.
  const mergedSettings = {
    ...(current.settings || {}),
    ...newSettings,
  };

  const organization = await orgRepo.updateOrganizationById(organizationId, {
    settings: mergedSettings,
  });

  logger.info(`Organization settings updated: ${organization._id}`);

  return organization.toJSON();
}

/**
 * Deactivates an Organization, immediately preventing all its Users
 * from authenticating. Data is preserved (FR-ORG-006, FR-ORG-010).
 *
 * Business rule: deactivation is allowed regardless of the number of
 * users — it is an administrative action on the organization as a whole,
 * not subject to the FR-ORG-007 admin-count constraint (which governs
 * user role changes, not org deactivation).
 *
 * @param {string} organizationId
 * @param {string} requestingUserId - For audit logging.
 * @returns {Promise<object>} The updated Organization as plain JSON.
 * @throws {AppError} 404 if not found.
 * @throws {AppError} 409 if already deactivated.
 */
async function deactivateOrganization(organizationId, requestingUserId) {
  const organization = await orgRepo.findOrganizationById(organizationId);
  if (!organization) {
    throw new AppError('Organization not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (!organization.isActive) {
    throw new AppError(
      'Organization is already deactivated.',
      HTTP_STATUS.CONFLICT
    );
  }

  const updated = await orgRepo.updateOrganizationById(organizationId, {
    isActive: false,
  });

  logger.warn(
    `Organization deactivated: ${organizationId} by user: ${requestingUserId}`
  );

  return updated.toJSON();
}

/**
 * Reactivates a previously deactivated Organization.
 * (FR-ORG-005 — the restoration path)
 *
 * @param {string} organizationId
 * @param {string} requestingUserId - For audit logging.
 * @returns {Promise<object>} The updated Organization as plain JSON.
 * @throws {AppError} 404 if not found.
 * @throws {AppError} 409 if already active.
 */
async function reactivateOrganization(organizationId, requestingUserId) {
  const organization = await orgRepo.findOrganizationById(organizationId);
  if (!organization) {
    throw new AppError('Organization not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (organization.isActive) {
    throw new AppError(
      'Organization is already active.',
      HTTP_STATUS.CONFLICT
    );
  }

  const updated = await orgRepo.updateOrganizationById(organizationId, {
    isActive: true,
  });

  logger.info(
    `Organization reactivated: ${organizationId} by user: ${requestingUserId}`
  );

  return updated.toJSON();
}

module.exports = {
  getOrganization,
  updateOrganizationProfile,
  updateOrganizationSettings,
  deactivateOrganization,
  reactivateOrganization,
};
