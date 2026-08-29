'use strict';

/**
 * tasks.model.js
 *
 * Mongoose schema for the Task entity.
 *
 * A Task is the primary unit of assignable work within a Project.
 * Every Task belongs to exactly one Project (immutable after creation — FR-TASK-011).
 *
 * SRS references: §3.4.5, FR-TASK-001 through FR-TASK-026
 *
 * Design decisions:
 * - projectId is immutable after creation (FR-TASK-011) — enforced in service.
 * - assignedTo stores a single User ObjectId (FR-TASK-007).
 * - completedAt is set when status transitions to COMPLETED (FR-TASK-016).
 * - status and priority use enums from tasks.constants.js.
 * - Subtasks are a separate collection (subtask.model.js) referencing taskId.
 */

const mongoose = require('mongoose');
const { TASK_STATUSES, TASK_PRIORITIES } = require('./tasks.constants');

const taskSchema = new mongoose.Schema(
  {
    // ── Ownership ──────────────────────────────────────────────────────────
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
      index: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required.'],
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user ID is required.'],
    },

    // ── Content ────────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Task title is required.'],
      trim: true,
      maxlength: [300, 'Title must not exceed 300 characters.'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description must not exceed 5000 characters.'],
      default: null,
    },

    // ── Assignment ─────────────────────────────────────────────────────────
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── Lifecycle ──────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: Object.values(TASK_STATUSES),
        message: `Status must be one of: ${Object.values(TASK_STATUSES).join(', ')}.`,
      },
      default: TASK_STATUSES.TODO,
    },

    priority: {
      type: String,
      enum: {
        values: Object.values(TASK_PRIORITIES),
        message: `Priority must be one of: ${Object.values(TASK_PRIORITIES).join(', ')}.`,
      },
      default: TASK_PRIORITIES.MEDIUM,
    },

    // ── Timeline ───────────────────────────────────────────────────────────
    dueDate: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
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

// ── Indexes ───────────────────────────────────────────────────────────────────
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ organizationId: 1, assignedTo: 1 });
taskSchema.index({ projectId: 1, priority: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
