'use strict';

/**
 * notifications.controller.js
 *
 * Thin controller layer for user notifications.
 */

const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendNoContent } = require('../../utils/apiResponse.util');
const notificationService = require('./notifications.service');

// ── GET /api/v1/notifications ──────────────────────────────────────────────────
const listNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.listUserNotifications(
    req.user._id,
    req.organizationId,
    req.query
  );

  return sendSuccess(
    res,
    'Notifications retrieved successfully.',
    {
      notifications: result.notifications,
      unreadCount: result.unreadCount,
    },
    200,
    {
      total: result.total,
      page: result.page,
      limit: result.limit,
    }
  );
});

// ── GET /api/v1/notifications/unread-count ─────────────────────────────────────
const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(
    req.user._id,
    req.organizationId
  );
  return sendSuccess(res, 'Unread count retrieved successfully.', result);
});

// ── PATCH /api/v1/notifications/:id/read ───────────────────────────────────────
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user._id
  );
  return sendSuccess(res, 'Notification marked as read.', { notification });
});

// ── PATCH /api/v1/notifications/read-all ───────────────────────────────────────
const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(
    req.user._id,
    req.organizationId
  );
  return sendSuccess(res, 'All notifications marked as read.');
});

// ── DELETE /api/v1/notifications/:id ───────────────────────────────────────────
const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(
    req.params.id,
    req.user._id
  );
  return sendNoContent(res);
});

module.exports = {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
