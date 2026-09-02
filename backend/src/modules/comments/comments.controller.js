'use strict';

/**
 * comments.controller.js
 *
 * Thin HTTP adapter for Comment endpoints.
 * No business logic — only extraction, delegation, and response.
 */

const asyncHandler     = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendNoContent } = require('../../utils/apiResponse.util');
const commentService   = require('./comments.service');

// ── List Comments ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/comments?entityType=TASK&entityId=:id
 */
const listComments = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.query;
  const comments = await commentService.listComments(
    entityType, entityId, req.organizationId, req.user
  );
  return sendSuccess(res, 'Comments retrieved successfully.', { comments });
});

// ── Get Single Comment ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/comments/:id
 */
const getCommentById = asyncHandler(async (req, res) => {
  const comment = await commentService.getCommentById(
    req.params.id, req.organizationId, req.user
  );
  return sendSuccess(res, 'Comment retrieved successfully.', { comment });
});

// ── Create Comment ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/comments
 */
const createComment = asyncHandler(async (req, res) => {
  const { entityType, entityId, content, visibility, mentions } = req.body;
  const comment = await commentService.createComment(
    entityType, entityId, req.organizationId,
    req.user._id.toString(),
    { content, visibility, mentions }
  );
  return sendCreated(res, 'Comment posted successfully.', { comment });
});

// ── Edit Comment ───────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/comments/:id
 */
const editComment = asyncHandler(async (req, res) => {
  const { content, mentions } = req.body;
  const comment = await commentService.editComment(
    req.params.id, req.organizationId, req.user, { content, mentions }
  );
  return sendSuccess(res, 'Comment updated successfully.', { comment });
});

// ── Delete Comment ─────────────────────────────────────────────────────────────

/**
 * DELETE /api/v1/comments/:id
 */
const deleteComment = asyncHandler(async (req, res) => {
  await commentService.deleteComment(req.params.id, req.organizationId, req.user);
  return sendNoContent(res);
});

module.exports = {
  listComments,
  getCommentById,
  createComment,
  editComment,
  deleteComment,
};
