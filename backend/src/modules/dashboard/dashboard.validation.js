'use strict';

/**
 * dashboard.validation.js
 *
 * Query validation for dashboard endpoints.
 */

const { query } = require('express-validator');

const validateDashboardQuery = [
  query('deadlineDays')
    .optional()
    .isInt({ min: 1, max: 90 })
    .withMessage('deadlineDays must be an integer between 1 and 90.'),
];

module.exports = {
  validateDashboardQuery,
};
