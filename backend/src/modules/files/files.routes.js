'use strict';

/**
 * files.routes.js
 *
 * Route definitions for the Files module.
 *
 * Route layout:
 *   GET    /                  - List files for an entity (?entityType=&entityId=)
 *   POST   /                  - Upload a file (multipart/form-data)
 *   GET    /:id               - Get file metadata
 *   PUT    /:id/version       - Replace file version (multipart/form-data)
 *   PATCH  /:id/visibility    - Update visibility (INTERNAL/SHARED)
 *   PATCH  /:id/archive       - Archive file
 *   PATCH  /:id/restore       - Restore archived file
 *   DELETE /:id               - Permanently delete file (Admin/Manager only)
 */

const { Router } = require('express');

const authenticate      = require('../../middleware/authenticate.middleware');
const authorizeRole     = require('../../middleware/authorizeRole.middleware');
const organizationScope = require('../../middleware/organizationScope.middleware');
const validateRequest   = require('../../middleware/validateRequest.middleware');
const upload            = require('../../middleware/upload.middleware');
const { ROLES }         = require('../../constants/roles.constants');

const fileController = require('./files.controller');
const {
  validateFileQuery,
  validateUploadFile,
  validateUpdateVisibility,
} = require('./files.validation');

const router = Router();

// All file routes require authentication and org scope.
router.use(authenticate, organizationScope);

// ── GET / — List files ─────────────────────────────────────────────────────────
router.get(
  '/',
  validateFileQuery, validateRequest,
  fileController.listFiles
);

// ── POST / — Upload file (multipart) ──────────────────────────────────────────
router.post(
  '/',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.EMPLOYEE),
  upload.single('file'),
  validateUploadFile, validateRequest,
  fileController.uploadFile
);

// ── GET /:id — Get file metadata ───────────────────────────────────────────────
router.get('/:id', fileController.getFileById);

// ── PUT /:id/version — Replace version (multipart) ────────────────────────────
router.put(
  '/:id/version',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.EMPLOYEE),
  upload.single('file'),
  fileController.replaceFileVersion
);

// ── PATCH /:id/visibility — Update visibility ──────────────────────────────────
router.patch(
  '/:id/visibility',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  validateUpdateVisibility, validateRequest,
  fileController.updateFileVisibility
);

// ── PATCH /:id/archive — Archive ───────────────────────────────────────────────
router.patch(
  '/:id/archive',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  fileController.archiveFile
);

// ── PATCH /:id/restore — Restore ───────────────────────────────────────────────
router.patch(
  '/:id/restore',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  fileController.restoreFile
);

// ── DELETE /:id — Hard delete ──────────────────────────────────────────────────
router.delete(
  '/:id',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  fileController.deleteFile
);

module.exports = router;
