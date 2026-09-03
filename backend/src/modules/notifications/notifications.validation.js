'use strict';

/**
 * notifications.validation.js
 *
 * Express-validator rules for notification endpoints.
 */

const { query, param } = require('express-validator');
const { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } = require('./notifications.constants');

const validateListNotifications = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),

  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean value.'),

  query('type')
    .optional()
    .isIn(Object.values(NOTIFICATION_TYPES))
    .withMessage(`Type must be one of: ${Object.values(NOTIFICATION_TYPES).join(', ')}.`),

  query('priority')
    .optional()
    .isIn(Object.values(NOTIFICATION_PRIORITIES))
    .withMessage(`Priority must be one of: ${Object.values(NOTIFICATION_PRIORITIES).join(', ')}.`),
];

const validateNotificationId = [
  param('id')
    .isMongoId()
    .withMessage('Notification ID must be a valid Mongo ID.'),
];

module.exports = {
  validateListNotifications,
  validateNotificationId,
};
