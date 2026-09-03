'use strict';

/**
 * files.constants.js
 *
 * Constants for the File Metadata entity.
 *
 * SRS references:
 *  - FR-FILE-002, FR-FILE-003, FR-FILE-004 (polymorphic entity association)
 *  - FR-FILE-005, FR-FILE-014 (visibility — internal vs shared with client)
 *  - FR-FILE-015, FR-FILE-016 (size + type validation)
 *  - FR-FILE-009, FR-FILE-011 (archival lifecycle)
 */

/**
 * Entity types a file can be attached to (polymorphic).
 */
const FILE_ENTITY_TYPES = Object.freeze({
  CLIENT:  'CLIENT',
  PROJECT: 'PROJECT',
  TASK:    'TASK',
});

/**
 * Visibility levels for a file record.
 * INTERNAL — visible to org team only.
 * SHARED   — visible to client-role users as well (FR-FILE-005, FR-FILE-014).
 */
const FILE_VISIBILITY = Object.freeze({
  INTERNAL: 'INTERNAL',
  SHARED:   'SHARED',
});

/**
 * File lifecycle statuses.
 * ACTIVE   — file is visible and accessible.
 * ARCHIVED — removed from active views but record preserved (FR-FILE-009).
 */
const FILE_STATUSES = Object.freeze({
  ACTIVE:   'ACTIVE',
  ARCHIVED: 'ARCHIVED',
});

/**
 * Allowed MIME types for upload (FR-FILE-016).
 * Cloudinary handles actual validation; this list is the server-side guard.
 */
const ALLOWED_MIME_TYPES = Object.freeze([
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text
  'text/plain', 'text/csv',
  // Archives
  'application/zip', 'application/x-zip-compressed',
]);

/**
 * Maximum file size in bytes (25 MB). (FR-FILE-015)
 */
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

module.exports = {
  FILE_ENTITY_TYPES,
  FILE_VISIBILITY,
  FILE_STATUSES,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
};
