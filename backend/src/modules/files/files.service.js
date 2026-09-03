'use strict';

/**
 * files.service.js
 *
 * Business logic for all File Management operations.
 *
 * Group A — List + Get
 * Group B — Upload (stream to Cloudinary)
 * Group C — Replace version
 * Group D — Archive, Restore, Delete
 *
 * Architecture (ARCHITECTURE_DECISIONS.md §9):
 *  - Calls repositories and Cloudinary only.
 *  - Throws AppError for all operational failures.
 *  - No req / res / next.
 *
 * Key rules from SRS:
 *  - FR-FILE-013: Every file belongs to exactly one parent entity.
 *  - FR-FILE-014: Client-role users only see VISIBILITY=SHARED files.
 *  - FR-FILE-010: Hard-delete removes file from both DB and Cloudinary.
 *  - FR-FILE-008: Version replacement preserves prior version reference.
 */

const AppError    = require('../../utils/appError.util');
const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');
const logger      = require('../../utils/logger.util');
const { ROLES }   = require('../../constants/roles.constants');

const fileRepo    = require('./files.repository');
const { cloudinary } = require('../../config/cloudinary.config');
const { FILE_ENTITY_TYPES, FILE_VISIBILITY, FILE_STATUSES } = require('./files.constants');

// ── Helper: upload buffer to Cloudinary via stream ────────────────────────────

function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'clientsphere', ...options },
      (error, result) => {
        if (error) return reject(new AppError('File upload to Cloudinary failed.', HTTP_STATUS.BAD_GATEWAY));
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// ── Helper: delete from Cloudinary ───────────────────────────────────────────

async function deleteFromCloudinary(publicId, resourceType = 'auto') {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    logger.warn(`[Cloudinary] Failed to delete ${publicId}: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP A — LIST + GET
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lists active files for a parent entity.
 * CLIENT-role users only see SHARED files (FR-FILE-005, FR-FILE-014).
 *
 * @param {string} entityType
 * @param {string} entityId
 * @param {string} organizationId
 * @param {object} requestingUser
 */
async function listFiles(entityType, entityId, organizationId, requestingUser) {
  if (!Object.values(FILE_ENTITY_TYPES).includes(entityType)) {
    throw new AppError('Invalid entity type.', HTTP_STATUS.BAD_REQUEST);
  }

  const visibilityFilter = requestingUser.role === ROLES.CLIENT
    ? { visibility: FILE_VISIBILITY.SHARED }
    : {};

  const files = await fileRepo.findFilesByEntity(entityId, entityType, visibilityFilter);
  return files.map(f => f.toJSON());
}

/**
 * Gets a single file's metadata.
 * Enforces visibility for CLIENT-role users (FR-FILE-014).
 *
 * @param {string} fileId
 * @param {string} organizationId
 * @param {object} requestingUser
 */
async function getFileById(fileId, organizationId, requestingUser) {
  const file = await fileRepo.findFileById(fileId, organizationId);
  if (!file) throw new AppError('File not found.', HTTP_STATUS.NOT_FOUND);

  if (
    requestingUser.role === ROLES.CLIENT &&
    file.visibility !== FILE_VISIBILITY.SHARED
  ) {
    throw new AppError('File not found.', HTTP_STATUS.NOT_FOUND);
  }

  return file.toJSON();
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP B — UPLOAD
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Uploads a file to Cloudinary and saves metadata to DB.
 * (FR-FILE-001, FR-FILE-002, FR-FILE-003, FR-FILE-004, FR-FILE-013)
 *
 * @param {string} entityType
 * @param {string} entityId
 * @param {string} organizationId
 * @param {string} uploadedBy
 * @param {object} fileBuffer  - { buffer, originalname, mimetype, size }
 * @param {string} visibility
 */
async function uploadFile(entityType, entityId, organizationId, uploadedBy, fileBuffer, visibility) {
  if (!Object.values(FILE_ENTITY_TYPES).includes(entityType)) {
    throw new AppError('Invalid entity type.', HTTP_STATUS.BAD_REQUEST);
  }

  // Upload to Cloudinary
  const result = await uploadBufferToCloudinary(fileBuffer.buffer, {
    folder: `clientsphere/${organizationId}/${entityType.toLowerCase()}/${entityId}`,
    public_id: `${Date.now()}_${fileBuffer.originalname.replace(/\s+/g, '_')}`,
  });

  // Persist metadata
  const file = await fileRepo.createFile({
    organizationId,
    uploadedBy,
    entityType,
    entityId,
    originalName:          fileBuffer.originalname,
    mimeType:              fileBuffer.mimetype,
    sizeBytes:             fileBuffer.size,
    cloudinaryPublicId:    result.public_id,
    cloudinaryUrl:         result.secure_url,
    cloudinaryResourceType: result.resource_type,
    visibility:            visibility || FILE_VISIBILITY.INTERNAL,
    status:                FILE_STATUSES.ACTIVE,
  });

  logger.info(`File uploaded: ${file.originalName} (${file._id}) on ${entityType} ${entityId}`);
  return file.toJSON();
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP C — REPLACE VERSION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Replaces the current file on Cloudinary with a new version.
 * Preserves old version reference in versions[] (FR-FILE-008).
 *
 * @param {string} fileId
 * @param {string} organizationId
 * @param {string} replacedBy
 * @param {object} fileBuffer
 */
async function replaceFileVersion(fileId, organizationId, replacedBy, fileBuffer) {
  const file = await fileRepo.findFileById(fileId, organizationId);
  if (!file) throw new AppError('File not found.', HTTP_STATUS.NOT_FOUND);
  if (file.status === FILE_STATUSES.ARCHIVED) {
    throw new AppError('Cannot replace an archived file.', HTTP_STATUS.UNPROCESSABLE_ENTITY);
  }

  // Push old version to history
  await fileRepo.pushFileVersion(fileId, {
    cloudinaryPublicId: file.cloudinaryPublicId,
    cloudinaryUrl:      file.cloudinaryUrl,
    replacedAt:         new Date(),
    replacedBy,
  });

  // Upload new version
  const result = await uploadBufferToCloudinary(fileBuffer.buffer, {
    folder: `clientsphere/${organizationId}`,
    public_id: `${Date.now()}_${fileBuffer.originalname.replace(/\s+/g, '_')}`,
  });

  const updated = await fileRepo.updateFileById(fileId, {
    originalName:          fileBuffer.originalname,
    mimeType:              fileBuffer.mimetype,
    sizeBytes:             fileBuffer.size,
    cloudinaryPublicId:    result.public_id,
    cloudinaryUrl:         result.secure_url,
    cloudinaryResourceType: result.resource_type,
  });

  logger.info(`File version replaced: ${fileId}`);
  return updated.toJSON();
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP D — ARCHIVE, RESTORE, DELETE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Archives a file — removes from active views (FR-FILE-009).
 */
async function archiveFile(fileId, organizationId) {
  const file = await fileRepo.findFileById(fileId, organizationId);
  if (!file) throw new AppError('File not found.', HTTP_STATUS.NOT_FOUND);
  if (file.status === FILE_STATUSES.ARCHIVED) {
    throw new AppError('File is already archived.', HTTP_STATUS.CONFLICT);
  }

  const updated = await fileRepo.updateFileById(fileId, { status: FILE_STATUSES.ARCHIVED });
  logger.info(`File archived: ${fileId}`);
  return updated.toJSON();
}

/**
 * Restores an archived file (FR-FILE-011).
 */
async function restoreFile(fileId, organizationId) {
  const file = await fileRepo.findFileById(fileId, organizationId);
  if (!file) throw new AppError('File not found.', HTTP_STATUS.NOT_FOUND);
  if (file.status !== FILE_STATUSES.ARCHIVED) {
    throw new AppError('Only archived files can be restored.', HTTP_STATUS.CONFLICT);
  }

  const updated = await fileRepo.updateFileById(fileId, { status: FILE_STATUSES.ACTIVE });
  logger.info(`File restored: ${fileId}`);
  return updated.toJSON();
}

/**
 * Permanently deletes a file from DB and Cloudinary (FR-FILE-010).
 */
async function deleteFile(fileId, organizationId) {
  const file = await fileRepo.findFileById(fileId, organizationId);
  if (!file) throw new AppError('File not found.', HTTP_STATUS.NOT_FOUND);

  // Delete from Cloudinary
  await deleteFromCloudinary(file.cloudinaryPublicId, file.cloudinaryResourceType);

  // Also delete old versions from Cloudinary
  for (const v of file.versions || []) {
    await deleteFromCloudinary(v.cloudinaryPublicId, file.cloudinaryResourceType);
  }

  await fileRepo.deleteFileById(fileId);
  logger.info(`File permanently deleted: ${fileId}`);
}

/**
 * Updates file visibility (INTERNAL ↔ SHARED).
 */
async function updateFileVisibility(fileId, organizationId, visibility) {
  const file = await fileRepo.findFileById(fileId, organizationId);
  if (!file) throw new AppError('File not found.', HTTP_STATUS.NOT_FOUND);

  if (!Object.values(FILE_VISIBILITY).includes(visibility)) {
    throw new AppError('Invalid visibility value.', HTTP_STATUS.BAD_REQUEST);
  }

  const updated = await fileRepo.updateFileById(fileId, { visibility });
  return updated.toJSON();
}

module.exports = {
  listFiles,
  getFileById,
  uploadFile,
  replaceFileVersion,
  archiveFile,
  restoreFile,
  deleteFile,
  updateFileVisibility,
};
