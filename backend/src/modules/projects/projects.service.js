'use strict';

/**
 * projects.service.js
 *
 * Business logic for all Project management operations.
 *
 * Split into logical groups:
 *  Group A — CRUD: listProjects, getProjectById, createProject, updateProject
 *  Group B — Lifecycle: changeStatus, archiveProject, restoreProject
 *  Group C — Team management: addMember, removeMember, addManager, removeManager
 *
 * Architecture (ARCHITECTURE_DECISIONS.md §9):
 *  - Calls repositories only — never Mongoose models directly.
 *  - Throws AppError for all operational failures.
 *  - No req / res / next.
 *
 * Org isolation (FR-ORG-008, FR-PROJ-015):
 *  - Every operation filters by organizationId.
 *
 * Note on FR-PROJ-022 (Audit Logging): wired in Module 12.
 */

const AppError = require('../../utils/appError.util');
const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');
const logger = require('../../utils/logger.util');
const { ROLES } = require('../../constants/roles.constants');

const projectRepo = require('./projects.repository');
const clientRepo  = require('../clients/clients.repository');
const userRepo    = require('../users/users.repository');
const { PROJECT_STATUSES, PROJECT_PRIORITIES, CLOSED_PROJECT_STATUSES } = require('./projects.constants');
const { CLIENT_STATUSES } = require('../clients/clients.model');

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP A — CRUD
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lists projects within an organization with search, filter, and pagination.
 * (FR-PROJ-015, FR-PROJ-016, FR-PROJ-017, FR-PROJ-018)
 *
 * Visibility rules:
 * - ADMINISTRATOR / MANAGER: all projects in the org.
 * - EMPLOYEE: only projects they are a member of.
 * - CLIENT: handled at route level (out of scope for this service method).
 *
 * @param {string} organizationId
 * @param {object} requestingUser  - { _id, role }
 * @param {object} query
 * @returns {Promise<{ projects: object[], total: number, page: number, limit: number }>}
 */
async function listProjects(organizationId, requestingUser, query = {}) {
  const { search, status, priority, clientId, page = 1, limit = 20 } = query;

  const filter = { organizationId };

  // Employees see only their assigned projects (FR-PROJ-015).
  if (requestingUser.role === ROLES.EMPLOYEE) {
    filter.members = requestingUser._id;
  }

  if (status && Object.values(PROJECT_STATUSES).includes(status)) {
    filter.status = status;
  }

  if (priority && Object.values(PROJECT_PRIORITIES).includes(priority)) {
    filter.priority = priority;
  }

  if (clientId) {
    filter.clientId = clientId;
  }

  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.name = new RegExp(escaped, 'i');
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [projects, total] = await Promise.all([
    projectRepo.findProjects(filter, { skip, limit: Number(limit) }),
    projectRepo.countProjects(filter),
  ]);

  return {
    projects: projects.map(p => p.toJSON()),
    total,
    page: Number(page),
    limit: Number(limit),
  };
}

/**
 * Gets a single project by ID scoped to the organization.
 * (FR-PROJ-003)
 *
 * @param {string} projectId
 * @param {string} organizationId
 * @returns {Promise<object>}
 * @throws {AppError} 404
 */
async function getProjectById(projectId, organizationId) {
  const project = await projectRepo.findProjectById(projectId, organizationId);
  if (!project) {
    throw new AppError('Project not found.', HTTP_STATUS.NOT_FOUND);
  }
  return project.toJSON();
}

/**
 * Creates a new Project.
 * Validates that the client exists, is active, and belongs to the org.
 * (FR-PROJ-001, FR-PROJ-007, FR-CLIENT-009, FR-PROJ-020)
 *
 * @param {string} organizationId
 * @param {string} createdBy
 * @param {object} data
 * @returns {Promise<object>}
 * @throws {AppError} 404, 409, 422
 */
async function createProject(organizationId, createdBy, data) {
  // Validate client exists, belongs to org, and is active.
  const client = await clientRepo.findClientById(data.clientId, organizationId);
  if (!client) {
    throw new AppError('Client not found in this organization.', HTTP_STATUS.NOT_FOUND);
  }
  if (client.status === CLIENT_STATUSES.ARCHIVED) {
    throw new AppError('Cannot create a project for an archived client.', HTTP_STATUS.UNPROCESSABLE_ENTITY);
  }

  // Advisory duplicate check: same name under same client (FR-PROJ-020).
  const duplicate = await projectRepo.findProject({
    organizationId,
    clientId: data.clientId,
    name: { $regex: new RegExp(`^${data.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  });
  if (duplicate) {
    throw new AppError(
      `A project named "${data.name.trim()}" already exists for this client.`,
      HTTP_STATUS.CONFLICT
    );
  }

  const project = await projectRepo.createProject({
    organizationId,
    clientId: data.clientId,
    createdBy,
    name: data.name.trim(),
    description: data.description || null,
    managers: data.managers || [],
    members: data.members || [],
    status: PROJECT_STATUSES.PLANNING,
    priority: data.priority || PROJECT_PRIORITIES.MEDIUM,
    startDate: data.startDate || null,
    dueDate: data.dueDate || null,
  });

  logger.info(`Project created: ${project.name} (${project._id}) in org ${organizationId}`);

  return project.toJSON();
}

/**
 * Updates a project's editable fields.
 * clientId is immutable after creation (FR-PROJ-007).
 * (FR-PROJ-002, FR-PROJ-012, FR-PROJ-013)
 *
 * @param {string} projectId
 * @param {string} organizationId
 * @param {object} updates
 * @returns {Promise<object>}
 * @throws {AppError} 404
 */
async function updateProject(projectId, organizationId, updates) {
  const existing = await projectRepo.findProjectById(projectId, organizationId);
  if (!existing) {
    throw new AppError('Project not found.', HTTP_STATUS.NOT_FOUND);
  }

  const allowed = ['name', 'description', 'priority', 'startDate', 'dueDate'];
  const allowedFields = {};
  allowed.forEach(f => {
    if (updates[f] !== undefined) allowedFields[f] = updates[f];
  });

  const project = await projectRepo.updateProjectById(projectId, allowedFields);

  logger.info(`Project updated: ${projectId}`);

  return project.toJSON();
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP B — LIFECYCLE / STATUS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Changes a project's lifecycle status.
 * (FR-PROJ-010, FR-PROJ-011)
 *
 * @param {string} projectId
 * @param {string} organizationId
 * @param {string} newStatus
 * @returns {Promise<object>}
 * @throws {AppError} 404, 409
 */
async function changeProjectStatus(projectId, organizationId, newStatus) {
  const project = await projectRepo.findProjectById(projectId, organizationId);
  if (!project) {
    throw new AppError('Project not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (project.status === newStatus) {
    throw new AppError(`Project is already in ${newStatus} status.`, HTTP_STATUS.CONFLICT);
  }

  const updated = await projectRepo.updateProjectById(projectId, { status: newStatus });

  logger.info(`Project status changed: ${projectId} → ${newStatus}`);

  return updated.toJSON();
}

/**
 * Archives a project — moves it to ARCHIVED status, preserving all data.
 * (FR-PROJ-004, FR-PROJ-021)
 *
 * @param {string} projectId
 * @param {string} organizationId
 * @returns {Promise<object>}
 * @throws {AppError} 404, 409
 */
async function archiveProject(projectId, organizationId) {
  const project = await projectRepo.findProjectById(projectId, organizationId);
  if (!project) {
    throw new AppError('Project not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (project.status === PROJECT_STATUSES.ARCHIVED) {
    throw new AppError('Project is already archived.', HTTP_STATUS.CONFLICT);
  }

  const updated = await projectRepo.updateProjectById(projectId, {
    status: PROJECT_STATUSES.ARCHIVED,
  });

  logger.info(`Project archived: ${projectId}`);

  return updated.toJSON();
}

/**
 * Restores an archived project to PLANNING status.
 * (FR-PROJ-005)
 *
 * @param {string} projectId
 * @param {string} organizationId
 * @returns {Promise<object>}
 * @throws {AppError} 404, 409
 */
async function restoreProject(projectId, organizationId) {
  const project = await projectRepo.findProjectById(projectId, organizationId);
  if (!project) {
    throw new AppError('Project not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (project.status !== PROJECT_STATUSES.ARCHIVED) {
    throw new AppError('Only archived projects can be restored.', HTTP_STATUS.CONFLICT);
  }

  const updated = await projectRepo.updateProjectById(projectId, {
    status: PROJECT_STATUSES.PLANNING,
  });

  logger.info(`Project restored: ${projectId}`);

  return updated.toJSON();
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP C — TEAM MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Adds a Manager to a project.
 * Validates the user is a MANAGER role in the org.
 * (FR-PROJ-008)
 *
 * @param {string} projectId
 * @param {string} organizationId
 * @param {string} userId
 * @returns {Promise<object>}
 * @throws {AppError} 404, 422
 */
async function addManager(projectId, organizationId, userId) {
  const project = await projectRepo.findProjectById(projectId, organizationId);
  if (!project) throw new AppError('Project not found.', HTTP_STATUS.NOT_FOUND);

  const user = await userRepo.findUser({ _id: userId, organizationId, isActive: true });
  if (!user) throw new AppError('User not found in this organization.', HTTP_STATUS.NOT_FOUND);

  if (user.role !== ROLES.MANAGER && user.role !== ROLES.ADMINISTRATOR) {
    throw new AppError('Only Managers or Administrators can be assigned as project managers.', HTTP_STATUS.UNPROCESSABLE_ENTITY);
  }

  const updated = await projectRepo.addManager(projectId, userId);

  logger.info(`Manager added to project ${projectId}: user ${userId}`);

  return updated.toJSON();
}

/**
 * Removes a Manager from a project.
 * (FR-PROJ-008)
 *
 * @param {string} projectId
 * @param {string} organizationId
 * @param {string} userId
 * @returns {Promise<object>}
 * @throws {AppError} 404
 */
async function removeManager(projectId, organizationId, userId) {
  const project = await projectRepo.findProjectById(projectId, organizationId);
  if (!project) throw new AppError('Project not found.', HTTP_STATUS.NOT_FOUND);

  const updated = await projectRepo.removeManager(projectId, userId);

  logger.info(`Manager removed from project ${projectId}: user ${userId}`);

  return updated.toJSON();
}

/**
 * Adds a member (Employee) to a project.
 * (FR-PROJ-009)
 *
 * @param {string} projectId
 * @param {string} organizationId
 * @param {string} userId
 * @returns {Promise<object>}
 * @throws {AppError} 404
 */
async function addMember(projectId, organizationId, userId) {
  const project = await projectRepo.findProjectById(projectId, organizationId);
  if (!project) throw new AppError('Project not found.', HTTP_STATUS.NOT_FOUND);

  const user = await userRepo.findUser({ _id: userId, organizationId, isActive: true });
  if (!user) throw new AppError('User not found in this organization.', HTTP_STATUS.NOT_FOUND);

  const updated = await projectRepo.addMember(projectId, userId);

  logger.info(`Member added to project ${projectId}: user ${userId}`);

  return updated.toJSON();
}

/**
 * Removes a member from a project.
 * (FR-PROJ-009)
 *
 * @param {string} projectId
 * @param {string} organizationId
 * @param {string} userId
 * @returns {Promise<object>}
 * @throws {AppError} 404
 */
async function removeMember(projectId, organizationId, userId) {
  const project = await projectRepo.findProjectById(projectId, organizationId);
  if (!project) throw new AppError('Project not found.', HTTP_STATUS.NOT_FOUND);

  const updated = await projectRepo.removeMember(projectId, userId);

  logger.info(`Member removed from project ${projectId}: user ${userId}`);

  return updated.toJSON();
}

module.exports = {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  changeProjectStatus,
  archiveProject,
  restoreProject,
  addManager,
  removeManager,
  addMember,
  removeMember,
};
