'use strict';

/**
 * files.repository.js
 *
 * All database access operations for the File Metadata entity.
 * No business logic — only Mongoose queries.
 *
 * Part A — Read operations
 * Part B — Write operations
 */

const File = require('./files.model');

// ═══════════════════════════════════════════════════════════════════════════════
// PART A — READ OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function findFileById(fileId, organizationId) {
  return File.findOne({ _id: fileId, organizationId });
}

/**
 * Lists active (non-archived) files for an entity.
 * Optionally filtered by visibility for CLIENT-role users.
 *
 * @param {string} entityId
 * @param {string} entityType
 * @param {object} [extraFilter]
 */
async function findFilesByEntity(entityId, entityType, extraFilter = {}) {
  return File.find({ entityId, entityType, status: 'ACTIVE', ...extraFilter })
    .sort({ createdAt: -1 });
}

async function countFilesByEntity(entityId, entityType) {
  return File.countDocuments({ entityId, entityType, status: 'ACTIVE' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART B — WRITE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function createFile(data) {
  return File.create(data);
}

async function updateFileById(fileId, updates) {
  return File.findByIdAndUpdate(
    fileId,
    { $set: updates },
    { new: true, runValidators: true }
  );
}

/**
 * Pushes a previous version entry into the versions[] array (FR-FILE-008).
 */
async function pushFileVersion(fileId, versionEntry) {
  return File.findByIdAndUpdate(
    fileId,
    { $push: { versions: versionEntry } },
    { new: true }
  );
}

async function deleteFileById(fileId) {
  return File.findByIdAndDelete(fileId);
}

module.exports = {
  findFileById,
  findFilesByEntity,
  countFilesByEntity,
  createFile,
  updateFileById,
  pushFileVersion,
  deleteFileById,
};
