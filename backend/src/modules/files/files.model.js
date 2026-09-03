'use strict';

/**
 * files.model.js
 *
 * Mongoose schema for the File Metadata entity.
 *
 * A File Metadata record stores information about a file uploaded to Cloudinary.
 * The actual file bytes live on Cloudinary; we only store metadata here.
 * Every record is polymorphically associated with exactly one parent entity:
 * a Client, a Project, or a Task (FR-FILE-013).
 *
 * SRS references: §3.4.10, §3.5.10, FR-FILE-001 through FR-FILE-018
 *
 * Design decisions:
 * - entityType + entityId for polymorphic ownership (FR-FILE-002/003/004).
 * - cloudinaryPublicId stored for deletion from Cloudinary on hard-delete (FR-FILE-010).
 * - visibility controls CLIENT-role access (FR-FILE-005, FR-FILE-014).
 * - status: ACTIVE/ARCHIVED — no hard delete via API except FR-FILE-010.
 * - versions[] array stores previous version publicIds (FR-FILE-008).
 * - uploadedBy attribution (FR-FILE-012).
 */

const mongoose = require('mongoose');
const { FILE_ENTITY_TYPES, FILE_VISIBILITY, FILE_STATUSES } = require('./files.constants');

const fileSchema = new mongoose.Schema(
  {
    // ── Ownership ──────────────────────────────────────────────────────────
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
      index: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploaded by user ID is required.'],
    },

    // ── Polymorphic parent entity ──────────────────────────────────────────
    entityType: {
      type: String,
      enum: {
        values: Object.values(FILE_ENTITY_TYPES),
        message: `Entity type must be one of: ${Object.values(FILE_ENTITY_TYPES).join(', ')}.`,
      },
      required: [true, 'Entity type is required.'],
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Entity ID is required.'],
      index: true,
    },

    // ── File metadata (FR-FILE-012) ────────────────────────────────────────
    originalName: {
      type: String,
      required: [true, 'Original filename is required.'],
      trim: true,
      maxlength: [500, 'Filename must not exceed 500 characters.'],
    },

    mimeType: {
      type: String,
      required: [true, 'MIME type is required.'],
    },

    sizeBytes: {
      type: Number,
      required: [true, 'File size is required.'],
    },

    // ── Cloudinary storage references ─────────────────────────────────────
    cloudinaryPublicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required.'],
    },

    cloudinaryUrl: {
      type: String,
      required: [true, 'Cloudinary URL is required.'],
    },

    cloudinaryResourceType: {
      type: String,
      default: 'auto',
    },

    // ── Version history (FR-FILE-008) ─────────────────────────────────────
    versions: [
      {
        cloudinaryPublicId: String,
        cloudinaryUrl:      String,
        replacedAt:         Date,
        replacedBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],

    // ── Visibility (FR-FILE-005, FR-FILE-014) ─────────────────────────────
    visibility: {
      type: String,
      enum: {
        values: Object.values(FILE_VISIBILITY),
        message: `Visibility must be one of: ${Object.values(FILE_VISIBILITY).join(', ')}.`,
      },
      default: FILE_VISIBILITY.INTERNAL,
    },

    // ── Lifecycle (FR-FILE-009, FR-FILE-011) ──────────────────────────────
    status: {
      type: String,
      enum: {
        values: Object.values(FILE_STATUSES),
        message: `Status must be one of: ${Object.values(FILE_STATUSES).join(', ')}.`,
      },
      default: FILE_STATUSES.ACTIVE,
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
fileSchema.index({ entityId: 1, entityType: 1, status: 1 });
fileSchema.index({ organizationId: 1, uploadedBy: 1 });

const File = mongoose.model('File', fileSchema);

module.exports = File;
