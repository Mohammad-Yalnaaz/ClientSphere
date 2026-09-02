'use strict';

/**
 * comments.service.js
 *
 * Business logic for all Comment operations.
 *
 * Group A — List + Get
 * Group B — Create
 * Group C — Edit + Delete (with ownership enforcement)
 *
 * Architecture (ARCHITECTURE_DECISIONS.md §9):
 *  - Calls repositories only.
 *  - Throws AppError for all operational failures.
 *  - No req / res / next.
 *
 * Key rules from SRS:
 *  - FR-COMMENT-012: Only author or Admin can edit/delete.
 *  - FR-COMMENT-013: CLIENT-role users only see VISIBILITY=CLIENT comments.
 *  - FR-COMMENT-010: authorId is set at creation and never changed.
 *  - FR-COMMENT-014: Soft-delete (isDeleted flag) preserves record for audit.
 *  - FR-COMMENT-006: mentions[] parsed from content (@userId patterns handled by client).
 */

const AppError    = require('../../utils/appError.util');
const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');
const logger      = require('../../utils/logger.util');
const { ROLES }   = require('../../constants/roles.constants');

const commentRepo = require('./comments.repository');
const taskRepo    = require('../tasks/tasks.repository');
const projectRepo = require('../projects/projects.repository');
const { COMMENT_ENTITY_TYPES, COMMENT_VISIBILITY } = require('./comments.constants');

// ── Helper: verify entity exists and is accessible ────────────────────────────

async function assertEntityExists(entityType, entityId, organizationId) {
  if (entityType === COMMENT_ENTITY_TYPES.TASK) {
    const task = await taskRepo.findTaskById(entityId, organizationId);
    if (!task) throw new AppError('Task not found.', HTTP_STATUS.NOT_FOUND);
    return task;
  }
  if (entityType === COMMENT_ENTITY_TYPES.PROJECT) {
    const project = await projectRepo.findProjectById(entityId, organizationId);
    if (!project) throw new AppError('Project not found.', HTTP_STATUS.NOT_FOUND);
    return project;
  }
  throw new AppError('Invalid entity type.', HTTP_STATUS.BAD_REQUEST);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP A — LIST + GET
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lists all comments for an entity in chronological order.
 * CLIENT-role users only see VISIBILITY=CLIENT comments (FR-COMMENT-013).
 *
 * @param {string} entityType  - 'TASK' | 'PROJECT'
 * @param {string} entityId
 * @param {string} organizationId
 * @param {object} requestingUser - { _id, role }
 */
async function listComments(entityType, entityId, organizationId, requestingUser) {
  await assertEntityExists(entityType, entityId, organizationId);

  const visibilityFilter = requestingUser.role === ROLES.CLIENT
    ? { visibility: COMMENT_VISIBILITY.CLIENT }
    : {};

  const comments = await commentRepo.findCommentsByEntity(entityId, entityType, visibilityFilter);
  return comments.map(c => c.toJSON());
}

/**
 * Gets a single comment by ID.
 * Respects CLIENT-role visibility restriction.
 *
 * @param {string} commentId
 * @param {string} organizationId
 * @param {object} requestingUser
 */
async function getCommentById(commentId, organizationId, requestingUser) {
  const comment = await commentRepo.findCommentById(commentId, organizationId);
  if (!comment || comment.isDeleted) {
    throw new AppError('Comment not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (
    requestingUser.role === ROLES.CLIENT &&
    comment.visibility !== COMMENT_VISIBILITY.CLIENT
  ) {
    throw new AppError('Comment not found.', HTTP_STATUS.NOT_FOUND);
  }

  return comment.toJSON();
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP B — CREATE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates a new comment on a Task or Project.
 * (FR-COMMENT-001, FR-COMMENT-002, FR-COMMENT-006, FR-COMMENT-010)
 *
 * @param {string} entityType
 * @param {string} entityId
 * @param {string} organizationId
 * @param {string} authorId
 * @param {object} data - { content, visibility, mentions }
 */
async function createComment(entityType, entityId, organizationId, authorId, data) {
  await assertEntityExists(entityType, entityId, organizationId);

  // CLIENT-role users can only post CLIENT-visible comments (FR-COMMENT-013)
  const visibility = data.visibility || COMMENT_VISIBILITY.INTERNAL;

  const comment = await commentRepo.createComment({
    organizationId,
    authorId,
    entityType,
    entityId,
    content:    data.content.trim(),
    mentions:   data.mentions || [],
    visibility,
  });

  logger.info(`Comment created: ${comment._id} on ${entityType} ${entityId}`);
  return comment.toJSON();
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP C — EDIT + DELETE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Edits a comment's content.
 * Only the author can edit (FR-COMMENT-003, FR-COMMENT-012).
 *
 * @param {string} commentId
 * @param {string} organizationId
 * @param {object} requestingUser - { _id, role }
 * @param {object} data - { content, mentions }
 */
async function editComment(commentId, organizationId, requestingUser, data) {
  const comment = await commentRepo.findCommentById(commentId, organizationId);
  if (!comment || comment.isDeleted) {
    throw new AppError('Comment not found.', HTTP_STATUS.NOT_FOUND);
  }

  // Ownership check — only author can edit (FR-COMMENT-012)
  if (String(comment.authorId) !== String(requestingUser._id)) {
    throw new AppError(
      'You can only edit your own comments.',
      HTTP_STATUS.FORBIDDEN
    );
  }

  const updates = {
    content:  data.content.trim(),
    editedAt: new Date(),
  };
  if (data.mentions !== undefined) updates.mentions = data.mentions;

  const updated = await commentRepo.updateCommentById(commentId, updates);
  logger.info(`Comment edited: ${commentId}`);
  return updated.toJSON();
}

/**
 * Soft-deletes a comment.
 * Author or Administrator can delete (FR-COMMENT-004, FR-COMMENT-012).
 *
 * @param {string} commentId
 * @param {string} organizationId
 * @param {object} requestingUser - { _id, role }
 */
async function deleteComment(commentId, organizationId, requestingUser) {
  const comment = await commentRepo.findCommentById(commentId, organizationId);
  if (!comment || comment.isDeleted) {
    throw new AppError('Comment not found.', HTTP_STATUS.NOT_FOUND);
  }

  const isAuthor = String(comment.authorId) === String(requestingUser._id);
  const isAdmin  = requestingUser.role === ROLES.ADMINISTRATOR;

  if (!isAuthor && !isAdmin) {
    throw new AppError(
      'You do not have permission to delete this comment.',
      HTTP_STATUS.FORBIDDEN
    );
  }

  await commentRepo.softDeleteComment(commentId);
  logger.info(`Comment soft-deleted: ${commentId} by user ${requestingUser._id}`);
}

module.exports = {
  listComments,
  getCommentById,
  createComment,
  editComment,
  deleteComment,
};
