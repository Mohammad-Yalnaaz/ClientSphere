'use strict';

/**
 * subtask.model.js
 *
 * Mongoose schema for the Subtask entity.
 *
 * A Subtask is a granular breakdown of a Task.
 * Every Subtask belongs to exactly one Task (and transitively one Project).
 *
 * SRS references: §3.4.6, FR-TASK-005, FR-TASK-006, FR-TASK-009, FR-TASK-017
 *
 * Design decisions:
 * - taskId is immutable after creation — enforced in service.
 * - isCompleted is a simple boolean (no sub-lifecycle needed for subtasks).
 * - completedAt tracks when it was marked done (feeds FR-TASK-017 progress calc).
 * - organizationId stored for fast org-scoped queries without joining up.
 */

const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema(
  {
    // ── Ownership ──────────────────────────────────────────────────────────
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
      index: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required.'],
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
      required: [true, 'Subtask title is required.'],
      trim: true,
      maxlength: [300, 'Subtask title must not exceed 300 characters.'],
    },

    // ── Completion ─────────────────────────────────────────────────────────
    isCompleted: {
      type: Boolean,
      default: false,
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

// ── Index for fast task-scoped queries ─────────────────────────────────────────
subtaskSchema.index({ taskId: 1, isCompleted: 1 });

const Subtask = mongoose.model('Subtask', subtaskSchema);

module.exports = Subtask;
