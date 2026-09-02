'use strict';

/**
 * comments.repository.js
 *
 * All database access operations for the Comment entity.
 * No business logic — only Mongoose queries.
 *
 * Part A — Read operations
 * Part B — Write operations
 */

const Comment = require('./comments.model');

// ═══════════════════════════════════════════════════════════════════════════════
// PART A — READ OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Finds a single comment by arbitrary filter.
 * @param {object} filter
 */
async function findComment(filter) {
  return Comment.findOne(filter);
}

/**
 * Finds a comment by its ID.
 * @param {string} commentId
 * @param {string} organizationId
 */
async function findCommentById(commentId, organizationId) {
  return Comment.findOne({ _id: commentId, organizationId });
}

/**
 * Finds all non-deleted comments for an entity (Task or Project),
 * ordered by createdAt ascending (FR-COMMENT-008).
 *
 * @param {string} entityId
 * @param {string} entityType  - 'TASK' | 'PROJECT'
 * @param {object} [visibilityFilter] - optional { visibility } filter
 */
async function findCommentsByEntity(entityId, entityType, visibilityFilter = {}) {
  const filter = { entityId, entityType, isDeleted: false, ...visibilityFilter };
  return Comment.find(filter).sort({ createdAt: 1 });
}

/**
 * Counts non-deleted comments for an entity.
 * @param {string} entityId
 * @param {string} entityType
 */
async function countCommentsByEntity(entityId, entityType) {
  return Comment.countDocuments({ entityId, entityType, isDeleted: false });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART B — WRITE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates a new Comment document.
 * @param {object} data
 */
async function createComment(data) {
  return Comment.create(data);
}

/**
 * Updates a comment by ID (content edit + editedAt).
 * @param {string} commentId
 * @param {object} updates
 */
async function updateCommentById(commentId, updates) {
  return Comment.findByIdAndUpdate(
    commentId,
    { $set: updates },
    { new: true, runValidators: true }
  );
}

/**
 * Soft-deletes a comment — sets isDeleted + deletedAt.
 * @param {string} commentId
 */
async function softDeleteComment(commentId) {
  return Comment.findByIdAndUpdate(
    commentId,
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true }
  );
}

module.exports = {
  findComment,
  findCommentById,
  findCommentsByEntity,
  countCommentsByEntity,
  createComment,
  updateCommentById,
  softDeleteComment,
};
