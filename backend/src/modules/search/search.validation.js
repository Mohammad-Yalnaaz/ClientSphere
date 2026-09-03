'use strict';

/**
 * search.validation.js
 *
 * Query validation for Global Search.
 */

const { query } = require('express-validator');

const validateSearchQuery = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must not exceed 100 characters.'),

  query('status')
    .optional()
    .trim(),

  query('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Priority must be one of: LOW, MEDIUM, HIGH, CRITICAL.'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be an integer between 1 and 50.'),
];

module.exports = {
  validateSearchQuery,
};
