'use strict';

/**
 * notifications.routes.js
 *
 * Express route definitions for Notifications.
 *
 * Routes:
 *   GET    /api/v1/notifications              - List notifications (paginated, filtered)
 *   GET    /api/v1/notifications/unread-count - Get total unread count
 *   PATCH  /api/v1/notifications/read-all     - Mark all notifications as read
 *   PATCH  /api/v1/notifications/:id/read     - Mark single notification as read
 *   DELETE /api/v1/notifications/:id          - Delete notification
 */

const { Router } = require('express');

const authenticate = require('../../middleware/authenticate.middleware');
const organizationScope = require('../../middleware/organizationScope.middleware');
const validateRequest = require('../../middleware/validateRequest.middleware');

const notificationController = require('./notifications.controller');
const {
  validateListNotifications,
  validateNotificationId,
} = require('./notifications.validation');

const router = Router();

// All notifications endpoints are strictly authenticated and organization-scoped
router.use(authenticate, organizationScope);

router.get(
  '/',
  validateListNotifications,
  validateRequest,
  notificationController.listNotifications
);

router.get('/unread-count', notificationController.getUnreadCount);

router.patch('/read-all', notificationController.markAllAsRead);

router.patch(
  '/:id/read',
  validateNotificationId,
  validateRequest,
  notificationController.markAsRead
);

router.delete(
  '/:id',
  validateNotificationId,
  validateRequest,
  notificationController.deleteNotification
);

module.exports = router;
