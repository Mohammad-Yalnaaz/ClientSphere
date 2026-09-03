'use strict';

/**
 * common.validation.js
 *
 * Reusable validation chains for pagination, sorting, and text searching.
 */

const { query } = require('express-validator');

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),
];

const validateSearchQuery = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must not exceed 100 characters.'),
];

module.exports = {
  validatePagination,
  validateSearchQuery,
};
