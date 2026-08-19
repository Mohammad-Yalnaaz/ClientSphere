'use strict';

/**
 * organizations.model.js
 *
 * Mongoose schema for the Organization entity.
 *
 * Design decisions:
 * - Organization is the root tenant boundary (SRS §3.4.1).
 *   Every other entity in the system references an Organization.
 * - isActive flag supports FR-ORG-006 (deactivation) and FR-ORG-010
 *   (deletion policy: we deactivate, never hard-delete).
 * - settings is a flexible sub-document to support FR-ORG-003 and
 *   FR-ORG-009 without requiring a schema migration.
 * - Timestamps (createdAt, updatedAt) are added by Mongoose automatically.
 * - No business logic, no virtual methods with side effects — schema only,
 *   per ARCHITECTURE_DECISIONS.md §9.
 */

const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Organization name is required.'],
      trim: true,
      minlength: [2, 'Organization name must be at least 2 characters.'],
      maxlength: [100, 'Organization name must not exceed 100 characters.'],
    },

    // ── Status ────────────────────────────────────────────────────────────
    // Supports FR-ORG-005 (active by default), FR-ORG-006 (deactivation).
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Branding (FR-ORG-004) ─────────────────────────────────────────────
    logoUrl: {
      type: String,
      default: null,
    },

    // ── Settings (FR-ORG-003, FR-ORG-009) ────────────────────────────────
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    // Let Mongoose manage createdAt and updatedAt.
    timestamps: true,

    // Remove __v field from API responses.
    versionKey: false,

    // toJSON: exclude internal fields from serialisation.
    toJSON: {
      virtuals: false,
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Fast lookup by name for duplicate-prevention checks (FR-ORG-002).
organizationSchema.index({ name: 1 });

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
