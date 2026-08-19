'use strict';

/**
 * clients.model.js
 *
 * Mongoose schema for the Client entity.
 *
 * The Client entity represents an external customer of an Organization —
 * the party on whose behalf all Projects in the system are delivered.
 * (SRS §3.4.3, FR-CLIENT-011)
 *
 * Design decisions:
 * - organizationId is required and indexed to enforce org isolation (FR-CLIENT-011).
 * - Status enum is 'ACTIVE' | 'ARCHIVED' to support FR-CLIENT-004/005.
 * - contactEmail uniqueness is checked at service layer (not DB unique index)
 *   because duplicate prevention is advisory, not hard-blocked (FR-CLIENT-010).
 * - No hard-delete: archival is the end-of-lifecycle state (FR-CLIENT-008).
 * - createdBy references the User who created the record for audit purposes.
 */

const mongoose = require('mongoose');

const CLIENT_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
});

const clientSchema = new mongoose.Schema(
  {
    // ── Ownership ──────────────────────────────────────────────────────────
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
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
      required: [true, 'Client name is required.'],
      trim: true,
      maxlength: [150, 'Client name must not exceed 150 characters.'],
    },

    // ── Contact Details ────────────────────────────────────────────────────
    contactName: {
      type: String,
      trim: true,
      maxlength: [100, 'Contact name must not exceed 100 characters.'],
      default: null,
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Contact email must be a valid email address.'],
      default: null,
    },

    contactPhone: {
      type: String,
      trim: true,
      maxlength: [30, 'Contact phone must not exceed 30 characters.'],
      default: null,
    },

    // ── Description / Notes ───────────────────────────────────────────────
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must not exceed 1000 characters.'],
      default: null,
    },

    // ── Branding ──────────────────────────────────────────────────────────
    logoUrl: {
      type: String,
      trim: true,
      default: null,
    },

    website: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Lifecycle ─────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: Object.values(CLIENT_STATUSES),
        message: `Status must be one of: ${Object.values(CLIENT_STATUSES).join(', ')}.`,
      },
      default: CLIENT_STATUSES.ACTIVE,
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

// ── Compound index for fast org-scoped queries (FR-CLIENT-011) ────────────────
clientSchema.index({ organizationId: 1, status: 1 });
clientSchema.index({ organizationId: 1, name: 1 });

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
module.exports.CLIENT_STATUSES = CLIENT_STATUSES;
