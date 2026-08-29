'use strict';

/**
 * projects.controller.js
 *
 * Thin HTTP adapter for Project management endpoints.
 *
 * Architecture rule (ARCHITECTURE_DECISIONS.md §9):
 *  - No business logic — only extraction, delegation, and response.
 *  - req.organizationId set by organizationScope middleware.
 *  - req.user set by authenticate middleware.
 */

const asyncHandler   = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendNoContent } = require('../../utils/apiResponse.util');
const projectService = require('./projects.service');

// ── List Projects ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/projects
 */
const listProjects = asyncHandler(async (req, res) => {
  const { search, status, priority, clientId, page, limit } = req.query;

  const result = await projectService.listProjects(
    req.organizationId,
    req.user,
    { search, status, priority, clientId, page, limit }
  );

  return sendSuccess(
    res,
    'Projects retrieved successfully.',
    { projects: result.projects },
    200,
    { total: result.total, page: result.page, limit: result.limit }
  );
});

// ── Get Single Project ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/projects/:id
 */
const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id, req.organizationId);
  return sendSuccess(res, 'Project retrieved successfully.', { project });
});

// ── Create Project ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/projects
 */
const createProject = asyncHandler(async (req, res) => {
  const { name, clientId, description, priority, startDate, dueDate, managers, members } = req.body;

  const project = await projectService.createProject(
    req.organizationId,
    req.user._id.toString(),
    { name, clientId, description, priority, startDate, dueDate, managers, members }
  );

  return sendCreated(res, 'Project created successfully.', { project });
});

// ── Update Project ─────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/projects/:id
 */
const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(
    req.params.id,
    req.organizationId,
    req.body
  );
  return sendSuccess(res, 'Project updated successfully.', { project });
});

// ── Change Status ──────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/projects/:id/status
 */
const changeProjectStatus = asyncHandler(async (req, res) => {
  const project = await projectService.changeProjectStatus(
    req.params.id,
    req.organizationId,
    req.body.status
  );
  return sendSuccess(res, 'Project status updated successfully.', { project });
});

// ── Archive / Restore ──────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/projects/:id/archive
 */
const archiveProject = asyncHandler(async (req, res) => {
  const project = await projectService.archiveProject(req.params.id, req.organizationId);
  return sendSuccess(res, 'Project archived successfully.', { project });
});

/**
 * PATCH /api/v1/projects/:id/restore
 */
const restoreProject = asyncHandler(async (req, res) => {
  const project = await projectService.restoreProject(req.params.id, req.organizationId);
  return sendSuccess(res, 'Project restored successfully.', { project });
});

// ── Team Management ────────────────────────────────────────────────────────────

/**
 * POST /api/v1/projects/:id/managers
 */
const addManager = asyncHandler(async (req, res) => {
  const project = await projectService.addManager(
    req.params.id, req.organizationId, req.body.userId
  );
  return sendSuccess(res, 'Manager added to project successfully.', { project });
});

/**
 * DELETE /api/v1/projects/:id/managers/:userId
 */
const removeManager = asyncHandler(async (req, res) => {
  const project = await projectService.removeManager(
    req.params.id, req.organizationId, req.params.userId
  );
  return sendSuccess(res, 'Manager removed from project successfully.', { project });
});

/**
 * POST /api/v1/projects/:id/members
 */
const addMember = asyncHandler(async (req, res) => {
  const project = await projectService.addMember(
    req.params.id, req.organizationId, req.body.userId
  );
  return sendSuccess(res, 'Member added to project successfully.', { project });
});

/**
 * DELETE /api/v1/projects/:id/members/:userId
 */
const removeMember = asyncHandler(async (req, res) => {
  const project = await projectService.removeMember(
    req.params.id, req.organizationId, req.params.userId
  );
  return sendSuccess(res, 'Member removed from project successfully.', { project });
});

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
