'use strict';

/**
 * activityLogs.validation.js
 *
 * Query validation rules for the activity logs endpoint.
 */

const { query } = require('express-validator');
const { ACTIVITY_ACTIONS, ACTIVITY_ENTITIES } = require('./activityLogs.constants');

const validateListActivityLogs = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),

  query('entityType')
    .optional()
    .isIn(Object.values(ACTIVITY_ENTITIES))
    .withMessage(`entityType must be one of: ${Object.values(ACTIVITY_ENTITIES).join(', ')}.`),

  query('entityId')
    .optional()
    .isMongoId()
    .withMessage('entityId must be a valid Mongo ID.'),

  query('action')
    .optional()
    .isIn(Object.values(ACTIVITY_ACTIONS))
    .withMessage(`action must be one of: ${Object.values(ACTIVITY_ACTIONS).join(', ')}.`),

  query('userId')
    .optional()
    .isMongoId()
    .withMessage('userId must be a valid Mongo ID.'),
];

module.exports = {
  validateListActivityLogs,
};
