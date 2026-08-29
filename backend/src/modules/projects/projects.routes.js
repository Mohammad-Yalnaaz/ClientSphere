'use strict';

/**
 * projects.routes.js
 *
 * Route definitions for the Projects module.
 *
 * Route layout:
 *   GET    /                        - List projects (Admin, Manager, Employee - scoped)
 *   POST   /                        - Create project (Admin, Manager)
 *   GET    /:id                     - Get single project (Admin, Manager, Employee - scoped)
 *   PATCH  /:id                     - Update project details (Admin, Manager)
 *   PATCH  /:id/status              - Change project status (Admin, Manager)
 *   PATCH  /:id/archive             - Archive project (Admin, Manager)
 *   PATCH  /:id/restore             - Restore archived project (Admin, Manager)
 *   POST   /:id/managers            - Add manager to project (Administrator only)
 *   DELETE /:id/managers/:userId    - Remove manager (Administrator only)
 *   POST   /:id/members             - Add member to project (Admin, Manager)
 *   DELETE /:id/members/:userId     - Remove member (Admin, Manager)
 *
 * All routes require authentication + org scope.
 */

const { Router } = require('express');

const authenticate      = require('../../middleware/authenticate.middleware');
const authorizeRole     = require('../../middleware/authorizeRole.middleware');
const organizationScope = require('../../middleware/organizationScope.middleware');
const validateRequest   = require('../../middleware/validateRequest.middleware');
const { ROLES }         = require('../../constants/roles.constants');

const projectController = require('./projects.controller');
const {
  validateCreateProject,
  validateUpdateProject,
  validateChangeStatus,
  validateAddTeamMember,
  validateListProjects,
} = require('./projects.validation');

const router = Router();

// All project routes require authentication and org scope.
router.use(authenticate, organizationScope);

// ── GET / — List projects (all authenticated users, scoped by role in service) ──
router.get(
  '/',
  validateListProjects,
  validateRequest,
  projectController.listProjects
);

// ── POST / — Create project (Admin, Manager) ──────────────────────────────────
router.post(
  '/',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  validateCreateProject,
  validateRequest,
  projectController.createProject
);

// ── GET /:id — Get single project ─────────────────────────────────────────────
router.get('/:id', projectController.getProjectById);

// ── PATCH /:id — Update project details (Admin, Manager) ──────────────────────
router.patch(
  '/:id',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  validateUpdateProject,
  validateRequest,
  projectController.updateProject
);

// ── PATCH /:id/status — Change status (Admin, Manager) ────────────────────────
router.patch(
  '/:id/status',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  validateChangeStatus,
  validateRequest,
  projectController.changeProjectStatus
);

// ── PATCH /:id/archive — Archive project (Admin, Manager) ─────────────────────
router.patch(
  '/:id/archive',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  projectController.archiveProject
);

// ── PATCH /:id/restore — Restore project (Admin, Manager) ─────────────────────
router.patch(
  '/:id/restore',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  projectController.restoreProject
);

// ── POST /:id/managers — Add manager (Administrator only) ─────────────────────
router.post(
  '/:id/managers',
  authorizeRole(ROLES.ADMINISTRATOR),
  validateAddTeamMember,
  validateRequest,
  projectController.addManager
);

// ── DELETE /:id/managers/:userId — Remove manager (Administrator only) ─────────
router.delete(
  '/:id/managers/:userId',
  authorizeRole(ROLES.ADMINISTRATOR),
  projectController.removeManager
);

// ── POST /:id/members — Add member (Admin, Manager) ──────────────────────────
router.post(
  '/:id/members',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  validateAddTeamMember,
  validateRequest,
  projectController.addMember
);

// ── DELETE /:id/members/:userId — Remove member (Admin, Manager) ──────────────
router.delete(
  '/:id/members/:userId',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  projectController.removeMember
);

module.exports = router;
