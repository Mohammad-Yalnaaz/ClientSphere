'use strict';

/**
 * projects.model.js
 *
 * Mongoose schema for the Project entity.
 *
 * A Project is the primary organizing unit for client work in ClientSphere.
 * Every Project belongs to exactly one Client (and transitively one Organization),
 * has at least one Manager, a defined lifecycle status, a priority, and a timeline.
 *
 * SRS references: §3.4.4, FR-PROJ-001 through FR-PROJ-022
 *
 * Design decisions:
 * - clientId is immutable after creation (FR-PROJ-007) — enforced in service layer.
 * - managers[] and members[] store User ObjectId references for team assignment
 *   (FR-PROJ-008, FR-PROJ-009).
 * - status and priority are enums, constants exported for reuse across layers.
 * - No hard-delete: archival is the end-of-lifecycle state (FR-PROJ-004).
 * - startDate / dueDate support timeline tracking (FR-PROJ-013).
 * - createdBy references the creating User for audit purposes (FR-PROJ-022).
 */

const mongoose = require('mongoose');

// ── Status and Priority constants are defined in projects.constants.js
// and imported here to keep the schema DRY.
const { PROJECT_STATUSES, PROJECT_PRIORITIES } = require('./projects.constants');

const projectSchema = new mongoose.Schema(
  {
    // ── Ownership ──────────────────────────────────────────────────────────
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
      index: true,
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required.'],
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user ID is required.'],
    },

    // ── Identifying Information ────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Project name is required.'],
      trim: true,
      maxlength: [200, 'Project name must not exceed 200 characters.'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description must not exceed 2000 characters.'],
      default: null,
    },

    // ── Team Assignment ────────────────────────────────────────────────────
    managers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // ── Lifecycle ─────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: Object.values(PROJECT_STATUSES),
        message: `Status must be one of: ${Object.values(PROJECT_STATUSES).join(', ')}.`,
      },
      default: PROJECT_STATUSES.PLANNING,
    },

    priority: {
      type: String,
      enum: {
        values: Object.values(PROJECT_PRIORITIES),
        message: `Priority must be one of: ${Object.values(PROJECT_PRIORITIES).join(', ')}.`,
      },
      default: PROJECT_PRIORITIES.MEDIUM,
    },

    // ── Timeline ──────────────────────────────────────────────────────────
    startDate: {
      type: Date,
      default: null,
    },

    dueDate: {
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

// ── Indexes for fast org-scoped queries ───────────────────────────────────────
projectSchema.index({ organizationId: 1, status: 1 });
projectSchema.index({ organizationId: 1, clientId: 1 });
projectSchema.index({ organizationId: 1, managers: 1 });
projectSchema.index({ organizationId: 1, members: 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
