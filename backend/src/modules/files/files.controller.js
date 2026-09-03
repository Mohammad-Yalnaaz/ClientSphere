'use strict';

/**
 * files.controller.js
 *
 * Thin HTTP adapter for File endpoints.
 * No business logic — only extraction, delegation, and response.
 */

const asyncHandler   = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendNoContent } = require('../../utils/apiResponse.util');
const fileService    = require('./files.service');

// ── List Files ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/files?entityType=&entityId=
 */
const listFiles = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.query;
  const files = await fileService.listFiles(
    entityType, entityId, req.organizationId, req.user
  );
  return sendSuccess(res, 'Files retrieved successfully.', { files });
});

// ── Get File ───────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/files/:id
 */
const getFileById = asyncHandler(async (req, res) => {
  const file = await fileService.getFileById(req.params.id, req.organizationId, req.user);
  return sendSuccess(res, 'File retrieved successfully.', { file });
});

// ── Upload File ────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/files
 * multipart/form-data — file in req.file, metadata in req.body
 */
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    const AppError = require('../../utils/appError.util');
    const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');
    throw new AppError('No file was uploaded.', HTTP_STATUS.BAD_REQUEST);
  }

  const { entityType, entityId, visibility } = req.body;
  const file = await fileService.uploadFile(
    entityType, entityId, req.organizationId,
    req.user._id.toString(),
    req.file,
    visibility
  );
  return sendCreated(res, 'File uploaded successfully.', { file });
});

// ── Replace Version ────────────────────────────────────────────────────────────

/**
 * PUT /api/v1/files/:id/version
 */
const replaceFileVersion = asyncHandler(async (req, res) => {
  if (!req.file) {
    const AppError = require('../../utils/appError.util');
    const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');
    throw new AppError('No file was uploaded.', HTTP_STATUS.BAD_REQUEST);
  }

  const file = await fileService.replaceFileVersion(
    req.params.id, req.organizationId,
    req.user._id.toString(),
    req.file
  );
  return sendSuccess(res, 'File version replaced successfully.', { file });
});

// ── Update Visibility ──────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/files/:id/visibility
 */
const updateFileVisibility = asyncHandler(async (req, res) => {
  const file = await fileService.updateFileVisibility(
    req.params.id, req.organizationId, req.body.visibility
  );
  return sendSuccess(res, 'File visibility updated successfully.', { file });
});

// ── Archive ────────────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/files/:id/archive
 */
const archiveFile = asyncHandler(async (req, res) => {
  const file = await fileService.archiveFile(req.params.id, req.organizationId);
  return sendSuccess(res, 'File archived successfully.', { file });
});

// ── Restore ────────────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/files/:id/restore
 */
const restoreFile = asyncHandler(async (req, res) => {
  const file = await fileService.restoreFile(req.params.id, req.organizationId);
  return sendSuccess(res, 'File restored successfully.', { file });
});

// ── Delete ─────────────────────────────────────────────────────────────────────

/**
 * DELETE /api/v1/files/:id
 */
const deleteFile = asyncHandler(async (req, res) => {
  await fileService.deleteFile(req.params.id, req.organizationId);
  return sendNoContent(res);
});

module.exports = {
  listFiles,
  getFileById,
  uploadFile,
  replaceFileVersion,
  updateFileVisibility,
  archiveFile,
  restoreFile,
  deleteFile,
};
