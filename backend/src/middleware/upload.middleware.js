'use strict';

/**
 * upload.middleware.js
 *
 * Multer middleware configured with memory storage.
 * Files are uploaded to Cloudinary via stream in files.service.js,
 * not stored on disk. Memory storage keeps the buffer in req.file.buffer.
 *
 * SRS references:
 *  - FR-FILE-015 (file size validation — 25 MB max)
 *  - FR-FILE-016 (unsupported file type rejection)
 */

const multer = require('multer');
const AppError = require('../utils/appError.util');
const HTTP_STATUS = require('../constants/httpStatusCodes.constants');
const { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } = require('../modules/files/files.constants');

const storage = multer.memoryStorage();

/**
 * MIME type filter — rejects unsupported file types (FR-FILE-016).
 */
function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new AppError(
        `File type "${file.mimetype}" is not supported. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}.`,
        HTTP_STATUS.UNPROCESSABLE_ENTITY
      ),
      false
    );
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES, // 25 MB (FR-FILE-015)
  },
});

module.exports = upload;
