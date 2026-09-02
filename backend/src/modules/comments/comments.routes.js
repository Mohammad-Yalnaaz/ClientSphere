'use strict';

/**
 * comments.routes.js
 *
 * Route definitions for the Comments module.
 *
 * Route layout:
 *   GET    /            - List comments for an entity (?entityType=&entityId=)
 *   POST   /            - Create a comment on a Task or Project
 *   GET    /:id         - Get a single comment
 *   PATCH  /:id         - Edit a comment (author only)
 *   DELETE /:id         - Soft-delete a comment (author or Admin)
 *
 * All routes require authentication + org scope.
 */

const { Router } = require('express');

const authenticate      = require('../../middleware/authenticate.middleware');
const organizationScope = require('../../middleware/organizationScope.middleware');
const validateRequest   = require('../../middleware/validateRequest.middleware');

const commentController = require('./comments.controller');
const { validateCreateComment, validateEditComment } = require('./comments.validation');

const router = Router();

// All comment routes require authentication and org scope.
router.use(authenticate, organizationScope);

// ── GET / — List comments for an entity ───────────────────────────────────────
router.get('/', commentController.listComments);

// ── POST / — Create a comment ─────────────────────────────────────────────────
router.post(
  '/',
  validateCreateComment, validateRequest,
  commentController.createComment
);

// ── GET /:id — Get single comment ─────────────────────────────────────────────
router.get('/:id', commentController.getCommentById);

// ── PATCH /:id — Edit comment (author only) ───────────────────────────────────
router.patch(
  '/:id',
  validateEditComment, validateRequest,
  commentController.editComment
);

// ── DELETE /:id — Soft-delete (author or Admin) ───────────────────────────────
router.delete('/:id', commentController.deleteComment);

module.exports = router;
