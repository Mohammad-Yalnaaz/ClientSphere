'use strict';

/**
 * notifications.model.js
 *
 * Mongoose schema for the Notification entity.
 *
 * Requirements:
 *  - recipientId: intended user (strictly private, visible only to them - FR-NOTIFY-014).
 *  - senderId: user who triggered the event (optional/system if null).
 *  - type: event category from NOTIFICATION_TYPES.
 *  - title & message: human-readable summaries.
 *  - priority: HIGH, NORMAL, LOW (FR-NOTIFY-008).
 *  - isRead: boolean flag, defaults to false (FR-NOTIFY-009).
 *  - readAt: timestamp when marked as read (FR-NOTIFY-010).
 *  - entityType & entityId: reference to parent task/project/comment.
 *  - TTL indexing: automatic expiration/retention support (FR-NOTIFY-017).
 */

const mongoose = require('mongoose');
const {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_ENTITY_TYPES,
} = require('./notifications.constants');

const notificationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
      index: true,
    },

    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient ID is required.'],
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    type: {
      type: String,
      enum: {
        values: Object.values(NOTIFICATION_TYPES),
        message: `Type must be one of: ${Object.values(NOTIFICATION_TYPES).join(', ')}.`,
      },
      required: [true, 'Notification type is required.'],
    },

    title: {
      type: String,
      required: [true, 'Notification title is required.'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters.'],
    },

    message: {
      type: String,
      required: [true, 'Notification message is required.'],
      trim: true,
      maxlength: [1000, 'Message must not exceed 1000 characters.'],
    },

    priority: {
      type: String,
      enum: {
        values: Object.values(NOTIFICATION_PRIORITIES),
        message: `Priority must be one of: ${Object.values(NOTIFICATION_PRIORITIES).join(', ')}.`,
      },
      default: NOTIFICATION_PRIORITIES.NORMAL,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    entityType: {
      type: String,
      enum: {
        values: Object.values(NOTIFICATION_ENTITY_TYPES),
        message: `Entity type must be one of: ${Object.values(NOTIFICATION_ENTITY_TYPES).join(', ')}.`,
      },
      default: null,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Compound indexes for user inbox queries & filtering
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ organizationId: 1, recipientId: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
