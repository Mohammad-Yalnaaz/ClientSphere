'use strict';

/**
 * comments.validation.js
 *
 * express-validator rule chains for all Comment endpoints.
 */

const { body, param } = require('express-validator');
const { COMMENT_ENTITY_TYPES, COMMENT_VISIBILITY } = require('./comments.constants');

const validEntityTypes  = Object.values(COMMENT_ENTITY_TYPES);
const validVisibilities = Object.values(COMMENT_VISIBILITY);

// ── Create comment ─────────────────────────────────────────────────────────────

const validateCreateComment = [
  body('entityType')
    .notEmpty().withMessage('Entity type is required.')
    .isIn(validEntityTypes)
    .withMessage(`Entity type must be one of: ${validEntityTypes.join(', ')}.`),

  body('entityId')
    .notEmpty().withMessage('Entity ID is required.')
    .isMongoId().withMessage('Entity ID must be a valid ID.'),

  body('content')
    .trim().notEmpty().withMessage('Comment content is required.')
    .isLength({ max: 10000 }).withMessage('Comment must not exceed 10000 characters.'),

  body('visibility')
    .optional()
    .isIn(validVisibilities)
    .withMessage(`Visibility must be one of: ${validVisibilities.join(', ')}.`),

  body('mentions')
    .optional()
    .isArray().withMessage('Mentions must be an array.')
    .custom(arr => arr.every(id => /^[a-f\d]{24}$/i.test(id)))
    .withMessage('Each mention must be a valid user ID.'),
];

// ── Edit comment ───────────────────────────────────────────────────────────────

const validateEditComment = [
  body('content')
    .trim().notEmpty().withMessage('Comment content is required.')
    .isLength({ max: 10000 }).withMessage('Comment must not exceed 10000 characters.'),

  body('mentions')
    .optional()
    .isArray().withMessage('Mentions must be an array.')
    .custom(arr => arr.every(id => /^[a-f\d]{24}$/i.test(id)))
    .withMessage('Each mention must be a valid user ID.'),
];

module.exports = {
  validateCreateComment,
  validateEditComment,
};
