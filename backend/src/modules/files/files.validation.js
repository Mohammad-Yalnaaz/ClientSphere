'use strict';

/**
 * files.validation.js
 *
 * express-validator rule chains for File endpoints.
 * Note: file binary validation (MIME type, size) is handled by upload middleware.
 */

const { query, body } = require('express-validator');
const { FILE_ENTITY_TYPES, FILE_VISIBILITY } = require('./files.constants');

const validEntityTypes  = Object.values(FILE_ENTITY_TYPES);
const validVisibilities = Object.values(FILE_VISIBILITY);

// ── List / upload query params ─────────────────────────────────────────────────

const validateFileQuery = [
  query('entityType')
    .notEmpty().withMessage('entityType is required.')
    .isIn(validEntityTypes)
    .withMessage(`entityType must be one of: ${validEntityTypes.join(', ')}.`),

  query('entityId')
    .notEmpty().withMessage('entityId is required.')
    .isMongoId().withMessage('entityId must be a valid ID.'),
];

// ── Upload (entityType + entityId in body) ────────────────────────────────────

const validateUploadFile = [
  body('entityType')
    .notEmpty().withMessage('entityType is required.')
    .isIn(validEntityTypes)
    .withMessage(`entityType must be one of: ${validEntityTypes.join(', ')}.`),

  body('entityId')
    .notEmpty().withMessage('entityId is required.')
    .isMongoId().withMessage('entityId must be a valid ID.'),

  body('visibility')
    .optional()
    .isIn(validVisibilities)
    .withMessage(`visibility must be one of: ${validVisibilities.join(', ')}.`),
];

// ── Update visibility ──────────────────────────────────────────────────────────

const validateUpdateVisibility = [
  body('visibility')
    .notEmpty().withMessage('visibility is required.')
    .isIn(validVisibilities)
    .withMessage(`visibility must be one of: ${validVisibilities.join(', ')}.`),
];

module.exports = {
  validateFileQuery,
  validateUploadFile,
  validateUpdateVisibility,
};
