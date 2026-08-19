'use strict';

/**
 * organizations.controller.js
 *
 * Thin HTTP adapter for Organization management endpoints.
 *
 * Responsibilities:
 *  - Extract validated inputs from req.body and req.organizationId.
 *  - Delegate all business logic to organizations.service.js.
 *  - Return standardised API responses.
 *
 * Architecture rule (ARCHITECTURE_DECISIONS.md §9):
 *  - No business logic here — only extraction, delegation, and response.
 *  - req.organizationId is set by organizationScope middleware.
 *  - req.user is set by authenticate middleware.
 */

const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendNoContent } = require('../../utils/apiResponse.util');
const orgService = require('./organizations.service');

// ── Get Organization ──────────────────────────────────────────────────────────

/**
 * GET /api/v1/organizations/me
 *
 * Returns the authenticated user's organization profile.
 * Available to all authenticated users within the organization.
 */
const getMyOrganization = asyncHandler(async (req, res) => {
  const organization = await orgService.getOrganization(req.organizationId);
  return sendSuccess(res, 'Organization retrieved successfully.', { organization });
});

// ── Update Organization Profile ───────────────────────────────────────────────

/**
 * PATCH /api/v1/organizations/me
 *
 * Updates the organization's name and/or logo URL.
 * Restricted to Administrator role (enforced in routes).
 */
const updateMyOrganization = asyncHandler(async (req, res) => {
  const { name, logoUrl } = req.body;
  const organization = await orgService.updateOrganizationProfile(req.organizationId, {
    name,
    logoUrl,
  });
  return sendSuccess(res, 'Organization profile updated successfully.', { organization });
});

// ── Update Organization Settings ──────────────────────────────────────────────

/**
 * PATCH /api/v1/organizations/me/settings
 *
 * Merges new key-value pairs into the organization's settings.
 * Restricted to Administrator role (enforced in routes).
 */
const updateMyOrganizationSettings = asyncHandler(async (req, res) => {
  const organization = await orgService.updateOrganizationSettings(
    req.organizationId,
    req.body.settings
  );
  return sendSuccess(res, 'Organization settings updated successfully.', { organization });
});

// ── Deactivate Organization ───────────────────────────────────────────────────

/**
 * PATCH /api/v1/organizations/me/deactivate
 *
 * Deactivates the organization — prevents all users from logging in.
 * Data is preserved. Restricted to Administrator role.
 */
const deactivateMyOrganization = asyncHandler(async (req, res) => {
  const organization = await orgService.deactivateOrganization(
    req.organizationId,
    req.user._id.toString()
  );
  return sendSuccess(res, 'Organization deactivated successfully.', { organization });
});

// ── Reactivate Organization ───────────────────────────────────────────────────

/**
 * PATCH /api/v1/organizations/me/reactivate
 *
 * Reactivates a previously deactivated organization.
 * Restricted to Administrator role.
 */
const reactivateMyOrganization = asyncHandler(async (req, res) => {
  const organization = await orgService.reactivateOrganization(
    req.organizationId,
    req.user._id.toString()
  );
  return sendSuccess(res, 'Organization reactivated successfully.', { organization });
});

module.exports = {
  getMyOrganization,
  updateMyOrganization,
  updateMyOrganizationSettings,
  deactivateMyOrganization,
  reactivateMyOrganization,
};
