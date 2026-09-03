'use strict';

/**
 * notifications.repository.js
 *
 * Database access layer for Notifications.
 *
 * Responsibilities:
 *  - findNotifications: retrieve paginated notifications for recipient.
 *  - countNotifications: count total notifications matching filter.
 *  - findNotificationById: retrieve single notification scoped by recipient.
 *  - createNotification: insert a new notification.
 *  - createManyNotifications: bulk insert notifications (e.g. for team broadcast).
 *  - markAsReadById: update single notification isRead & readAt.
 *  - markAllAsReadByRecipient: update all unread notifications for recipient.
 *  - deleteNotificationById: delete individual notification.
 */

const Notification = require('./notifications.model');

async function findNotifications(filter, options = {}) {
  const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
  return Notification.find(filter)
    .populate('senderId', 'firstName lastName email avatarUrl')
    .skip(skip)
    .limit(limit)
    .sort(sort);
}

async function countNotifications(filter) {
  return Notification.countDocuments(filter);
}

async function findNotificationById(notificationId, recipientId) {
  return Notification.findOne({ _id: notificationId, recipientId })
    .populate('senderId', 'firstName lastName email avatarUrl');
}

async function createNotification(data) {
  return Notification.create(data);
}

async function createManyNotifications(docs) {
  if (!docs || docs.length === 0) return [];
  return Notification.insertMany(docs);
}

async function markAsReadById(notificationId, recipientId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipientId },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );
}

async function markAllAsReadByRecipient(recipientId, organizationId) {
  return Notification.updateMany(
    { recipientId, organizationId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
}

async function deleteNotificationById(notificationId, recipientId) {
  return Notification.findOneAndDelete({ _id: notificationId, recipientId });
}

module.exports = {
  findNotifications,
  countNotifications,
  findNotificationById,
  createNotification,
  createManyNotifications,
  markAsReadById,
  markAllAsReadByRecipient,
  deleteNotificationById,
};
