'use strict';

/**
 * activityLogs.model.js
 *
 * Mongoose schema for the Activity Log audit trail.
 *
 * Immutability & Append-Only (Section 3.4.9, Section 5.12.5):
 *  - No updates or deletions allowed on activity logs.
 *  - Organization isolation: every log is scoped to organizationId.
 *  - Actor tracking: userId reference for accountable auditing.
 *  - Polymorphic target: entityType and entityId for the affected entity.
 *  - Metadata / payload: details object storing old/new values or extra context.
 */

const mongoose = require('mongoose');
const { ACTIVITY_ACTIONS, ACTIVITY_ENTITIES } = require('./activityLogs.constants');

const activityLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Acting User ID is required.'],
      index: true,
    },

    action: {
      type: String,
      enum: {
        values: Object.values(ACTIVITY_ACTIONS),
        message: `Action must be one of: ${Object.values(ACTIVITY_ACTIONS).join(', ')}.`,
      },
      required: [true, 'Action is required.'],
      index: true,
    },

    entityType: {
      type: String,
      enum: {
        values: Object.values(ACTIVITY_ENTITIES),
        message: `Entity type must be one of: ${Object.values(ACTIVITY_ENTITIES).join(', ')}.`,
      },
      required: [true, 'Entity type is required.'],
      index: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Entity ID is required.'],
      index: true,
    },

    description: {
      type: String,
      required: [true, 'Description is required.'],
      trim: true,
      maxlength: [1000, 'Description must not exceed 1000 characters.'],
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Append-only: only createdAt
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

// Compound indexes for fast audit history retrieval
activityLogSchema.index({ organizationId: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
activityLogSchema.index({ organizationId: 1, userId: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
