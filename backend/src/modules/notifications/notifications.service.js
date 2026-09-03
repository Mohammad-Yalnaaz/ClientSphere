'use strict';

/**
 * notifications.service.js
 *
 * Business logic for Notification management and triggering.
 *
 * Requirements:
 *  - listUserNotifications: get notifications for logged in user with pagination & filter.
 *  - getUnreadCount: count of unread notifications for badge display.
 *  - markAsRead: mark individual notification as read (FR-NOTIFY-010).
 *  - markAllAsRead: mark all user notifications as read (FR-NOTIFY-011).
 *  - deleteNotification: remove a notification (FR-NOTIFY-017).
 *  - createNotification: dispatch a notification to a specific recipient.
 *  - notifyUsers: helper to notify multiple users avoiding duplicates (FR-NOTIFY-016).
 */

const AppError = require('../../utils/appError.util');
const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');
const logger = require('../../utils/logger.util');

const notificationRepo = require('./notifications.repository');
const {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
} = require('./notifications.constants');

/**
 * Lists notifications for the requesting user.
 * Strictly enforces that recipientId === requestingUser._id (FR-NOTIFY-014).
 */
async function listUserNotifications(userId, organizationId, query = {}) {
  const { page = 1, limit = 20, isRead, type, priority } = query;

  const filter = {
    recipientId: userId,
    organizationId,
  };

  if (isRead !== undefined) {
    filter.isRead = isRead === 'true' || isRead === true;
  }

  if (type && Object.values(NOTIFICATION_TYPES).includes(type)) {
    filter.type = type;
  }

  if (priority && Object.values(NOTIFICATION_PRIORITIES).includes(priority)) {
    filter.priority = priority;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    notificationRepo.findNotifications(filter, { skip, limit: Number(limit) }),
    notificationRepo.countNotifications(filter),
    notificationRepo.countNotifications({ recipientId: userId, organizationId, isRead: false }),
  ]);

  return {
    notifications: notifications.map((n) => n.toJSON()),
    total,
    unreadCount,
    page: Number(page),
    limit: Number(limit),
  };
}

/**
 * Returns the unread notification count for the user.
 */
async function getUnreadCount(userId, organizationId) {
  const count = await notificationRepo.countNotifications({
    recipientId: userId,
    organizationId,
    isRead: false,
  });
  return { unreadCount: count };
}

/**
 * Marks a single notification as read by ID.
 */
async function markAsRead(notificationId, userId) {
  const notification = await notificationRepo.markAsReadById(notificationId, userId);
  if (!notification) {
    throw new AppError('Notification not found.', HTTP_STATUS.NOT_FOUND);
  }
  return notification.toJSON();
}

/**
 * Marks all unread notifications for the user as read.
 */
async function markAllAsRead(userId, organizationId) {
  await notificationRepo.markAllAsReadByRecipient(userId, organizationId);
  logger.info(`All notifications marked as read for user: ${userId}`);
  return { success: true };
}

/**
 * Deletes a notification by ID.
 */
async function deleteNotification(notificationId, userId) {
  const deleted = await notificationRepo.deleteNotificationById(notificationId, userId);
  if (!deleted) {
    throw new AppError('Notification not found.', HTTP_STATUS.NOT_FOUND);
  }
  logger.info(`Notification deleted: ${notificationId} by user: ${userId}`);
}

/**
 * Core dispatch function to create and record a notification.
 * Dispatches real-time events if socket emitter is attached.
 */
async function dispatchNotification({
  organizationId,
  recipientId,
  senderId = null,
  type,
  title,
  message,
  priority = NOTIFICATION_PRIORITIES.NORMAL,
  entityType = null,
  entityId = null,
}) {
  // Prevent notifying sender of their own actions
  if (senderId && String(senderId) === String(recipientId)) {
    return null;
  }

  const notification = await notificationRepo.createNotification({
    organizationId,
    recipientId,
    senderId,
    type,
    title,
    message,
    priority,
    entityType,
    entityId,
  });

  logger.info(`Notification dispatched: [${type}] to user ${recipientId}`);
  return notification.toJSON();
}

module.exports = {
  listUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  dispatchNotification,
};
