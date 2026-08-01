'use strict';

/**
 * uploadHandler.middleware.js
 *
 * Multer configuration for multipart/form-data file uploads.
 *
 * Per ARCHITECTURE_DECISIONS.md §2 and SRS §2.7, uploaded files are
 * validated and temporarily buffered in memory before the backend
 * generates Cloudinary signed-upload parameters. The browser never
 * receives direct Cloudinary credentials.
 *
 * Implementation: Module 7 (Files).
 * The full multer configuration (allowed MIME types, max size from
 * FR-FILE-015 and FR-FILE-016) is implemented in Module 7 alongside
 * the File model and Cloudinary config. The interface is declared here
 * in Module 1 so that it can be imported by the file routes without
 * creating circular dependencies.
 *
 * File size limit (FR-FILE-015): 25 MB
 * Allowed types (FR-FILE-016): images, PDFs, common office documents,
 *   plain text, CSV, ZIP archives.
 */

const multer = require('multer');
const AppError = require('../utils/appError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constants');

// 25 MB in bytes — matches SRS FR-FILE-015
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

/**
 * MIME types accepted by the platform (SRS FR-FILE-016).
 * Module 7 will expand this set after validation with the Cloudinary config.
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
]);

/**
 * Multer file filter — rejects unsupported MIME types immediately
 * before the file is buffered, with a user-actionable error message.
 */
function fileFilter(req, file, callback) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new AppError(
        `File type '${file.mimetype}' is not supported. ` +
          'Accepted types: images, PDF, Word, Excel, PowerPoint, text, CSV, ZIP.',
        HTTP_STATUS.BAD_REQUEST
      ),
      false
    );
  }
}

/**
 * Multer instance configured with in-memory storage, size limit, and
 * MIME type filtering. Used by file upload route handlers.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter,
});

module.exports = { upload, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES };
