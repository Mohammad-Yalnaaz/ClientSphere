'use strict';

/**
 * comments.model.js
 *
 * Mongoose schema for the Comment entity.
 *
 * A Comment can be attached to either a Task or a Project (polymorphic).
 * Every Comment is permanently attributed to its author (FR-COMMENT-010).
 * Timestamps record creation and last-edit times (FR-COMMENT-011).
 * Visibility controls client-role access (FR-COMMENT-013).
 * mentions[] stores @-mentioned user IDs (FR-COMMENT-006).
 *
 * SRS references: §3.4.7, FR-COMMENT-001 through FR-COMMENT-014
 *
 * Design decisions:
 * - Polymorphic via entityType + entityId (Task or Project).
 * - isDeleted soft-delete flag — deleted comments stay in DB for audit (FR-COMMENT-014).
 * - editedAt is set on first edit and updated on each subsequent edit (FR-COMMENT-011).
 * - parentId reserved for future threaded replies (FR-COMMENT-009).
 */

const mongoose = require('mongoose');
const { COMMENT_ENTITY_TYPES, COMMENT_VISIBILITY } = require('./comments.constants');

const commentSchema = new mongoose.Schema(
  {
    // ── Ownership ──────────────────────────────────────────────────────────
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
      index: true,
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required.'],
    },

    // ── Polymorphic attachment ─────────────────────────────────────────────
    entityType: {
      type: String,
      enum: {
        values: Object.values(COMMENT_ENTITY_TYPES),
        message: `Entity type must be one of: ${Object.values(COMMENT_ENTITY_TYPES).join(', ')}.`,
      },
      required: [true, 'Entity type is required.'],
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Entity ID is required.'],
      index: true,
    },

    // ── Content ────────────────────────────────────────────────────────────
    content: {
      type: String,
      required: [true, 'Comment content is required.'],
      trim: true,
      maxlength: [10000, 'Comment must not exceed 10000 characters.'],
    },

    // ── Mentions (FR-COMMENT-006) ──────────────────────────────────────────
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // ── Visibility (FR-COMMENT-013) ────────────────────────────────────────
    visibility: {
      type: String,
      enum: {
        values: Object.values(COMMENT_VISIBILITY),
        message: `Visibility must be one of: ${Object.values(COMMENT_VISIBILITY).join(', ')}.`,
      },
      default: COMMENT_VISIBILITY.INTERNAL,
    },

    // ── Edit tracking (FR-COMMENT-011) ────────────────────────────────────
    editedAt: {
      type: Date,
      default: null,
    },

    // ── Soft delete (FR-COMMENT-004, FR-COMMENT-014) ──────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    // ── Future: threaded replies (FR-COMMENT-009) ─────────────────────────
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
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
commentSchema.index({ entityId: 1, entityType: 1, isDeleted: 1, createdAt: 1 });
commentSchema.index({ organizationId: 1, authorId: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
