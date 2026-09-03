'use strict';

/**
 * aiServices.validation.js
 *
 * Express-validator chains for AI endpoints.
 */

const { body, param, query } = require('express-validator');

const validateTaskDescription = [
  param('projectId')
    .isMongoId()
    .withMessage('Project ID must be a valid Mongo ID.'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required.')
    .isLength({ max: 300 })
    .withMessage('Task title must not exceed 300 characters.'),

  body('context')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Context must not exceed 2000 characters.'),
];

const validateProjectSummary = [
  param('projectId')
    .isMongoId()
    .withMessage('Project ID must be a valid Mongo ID.'),
];

const validateCommentSummary = [
  query('entityType')
    .isIn(['TASK', 'PROJECT'])
    .withMessage('entityType must be either TASK or PROJECT.'),

  query('entityId')
    .isMongoId()
    .withMessage('entityId must be a valid Mongo ID.'),
];

module.exports = {
  validateTaskDescription,
  validateProjectSummary,
  validateCommentSummary,
};
