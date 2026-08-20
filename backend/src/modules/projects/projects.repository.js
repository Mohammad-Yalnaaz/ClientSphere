'use strict';

/**
 * projects.repository.js
 *
 * All database access operations for the Project entity.
 * No business logic — only Mongoose queries.
 *
 * Split into:
 *  Part A — Read operations  (findProject, findProjectById, findProjects, countProjects)
 *  Part B — Write operations (createProject, updateProjectById, addTeamMember,
 *                             removeTeamMember, addManager, removeManager)
 *
 * Architecture (ARCHITECTURE_DECISIONS.md §9):
 *  - Services call these methods; they never import Mongoose models directly.
 */

const Project = require('./projects.model');

// ═══════════════════════════════════════════════════════════════════════════════
// PART A — READ OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Finds a single Project matching a filter object.
 *
 * @param {object} filter
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findProject(filter) {
  return Project.findOne(filter);
}

/**
 * Finds a Project by its ID scoped to an organization.
 *
 * @param {string} projectId
 * @param {string} organizationId
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findProjectById(projectId, organizationId) {
  return Project.findOne({ _id: projectId, organizationId });
}

/**
 * Finds all Projects matching a filter with optional pagination and sorting.
 *
 * @param {object} filter
 * @param {object} [options]
 * @param {number} [options.skip=0]
 * @param {number} [options.limit=20]
 * @param {object} [options.sort={ createdAt: -1 }]
 * @returns {Promise<import('mongoose').Document[]>}
 */
async function findProjects(filter, options = {}) {
  const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
  return Project.find(filter).skip(skip).limit(limit).sort(sort);
}

/**
 * Counts Projects matching a filter.
 *
 * @param {object} filter
 * @returns {Promise<number>}
 */
async function countProjects(filter) {
  return Project.countDocuments(filter);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART B — WRITE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates a new Project document.
 *
 * @param {object} data
 * @returns {Promise<import('mongoose').Document>}
 */
async function createProject(data) {
  return Project.create(data);
}

/**
 * Updates a Project by ID and returns the updated document.
 *
 * @param {string} projectId
 * @param {object} updates
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function updateProjectById(projectId, updates) {
  return Project.findByIdAndUpdate(
    projectId,
    { $set: updates },
    { new: true, runValidators: true }
  );
}

/**
 * Adds a member (Employee) to a project's members array.
 * Uses $addToSet to prevent duplicates.
 *
 * @param {string} projectId
 * @param {string} userId
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function addMember(projectId, userId) {
  return Project.findByIdAndUpdate(
    projectId,
    { $addToSet: { members: userId } },
    { new: true }
  );
}

/**
 * Removes a member from a project's members array.
 *
 * @param {string} projectId
 * @param {string} userId
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function removeMember(projectId, userId) {
  return Project.findByIdAndUpdate(
    projectId,
    { $pull: { members: userId } },
    { new: true }
  );
}

/**
 * Adds a manager to a project's managers array.
 * Uses $addToSet to prevent duplicates.
 *
 * @param {string} projectId
 * @param {string} userId
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function addManager(projectId, userId) {
  return Project.findByIdAndUpdate(
    projectId,
    { $addToSet: { managers: userId } },
    { new: true }
  );
}

/**
 * Removes a manager from a project's managers array.
 *
 * @param {string} projectId
 * @param {string} userId
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function removeManager(projectId, userId) {
  return Project.findByIdAndUpdate(
    projectId,
    { $pull: { managers: userId } },
    { new: true }
  );
}

module.exports = {
  // Read
  findProject,
  findProjectById,
  findProjects,
  countProjects,
  // Write
  createProject,
  updateProjectById,
  addMember,
  removeMember,
  addManager,
  removeManager,
};
