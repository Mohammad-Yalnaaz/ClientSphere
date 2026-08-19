'use strict';

/**
 * organizations.validation.js
 *
 * express-validator rule chains for all Organization management endpoints.
 *
 * Design decisions:
 * - Each exported array is spread directly into the route definition
 *   before the controller, consistent with the auth module pattern.
 * - All updates are optional (PATCH semantics) — at least one field
 *   must be present, checked via .custom() in the combined validator.
 * - Settings accepts any valid object — content validation is intentionally
 *   loose to support FR-ORG-009's flexibility requirement.
 */

const { body } = require('express-validator');

// ── Update Profile (PATCH /organizations/me) ──────────────────────────────────

/**
 * Validates organization profile update.
 * Both fields are optional but at least one must be provided.
 */
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters.'),

  body('logoUrl')
    .optional()
    .trim()
    .isURL({ require_protocol: true })
    .withMessage('Logo URL must be a valid URL with a protocol (https://).'),

  // Ensure at least one field was sent.
  body().custom((_, { req }) => {
    const { name, logoUrl } = req.body;
    if (name === undefined && logoUrl === undefined) {
      throw new Error('At least one field (name or logoUrl) is required.');
    }
    return true;
  }),
];

// ── Update Settings (PATCH /organizations/me/settings) ───────────────────────

/**
 * Validates organization settings update.
 * Settings must be a non-empty object.
 */
const validateUpdateSettings = [
  body('settings')
    .notEmpty()
    .withMessage('Settings object is required.')
    .isObject()
    .withMessage('Settings must be a valid JSON object.'),
];

module.exports = {
  validateUpdateProfile,
  validateUpdateSettings,
};
