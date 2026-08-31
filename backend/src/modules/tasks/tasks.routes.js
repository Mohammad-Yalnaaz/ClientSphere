'use strict';

/**
 * tasks.routes.js
 *
 * Route definitions for the Tasks module.
 * All task routes are nested under /projects/:projectId/tasks
 * so that project context is always present.
 *
 * Route layout:
 *   GET    /projects/:projectId/tasks                           - List tasks
 *   POST   /projects/:projectId/tasks                          - Create task
 *   GET    /projects/:projectId/tasks/:taskId                  - Get task
 *   PATCH  /projects/:projectId/tasks/:taskId                  - Update task
 *   PATCH  /projects/:projectId/tasks/:taskId/status           - Change status
 *   PATCH  /projects/:projectId/tasks/:taskId/archive          - Archive
 *   PATCH  /projects/:projectId/tasks/:taskId/restore          - Restore
 *   POST   /projects/:projectId/tasks/:taskId/assign           - Assign task
 *   DELETE /projects/:projectId/tasks/:taskId/assign           - Unassign task
 *   GET    /projects/:projectId/tasks/:taskId/subtasks         - List subtasks
 *   POST   /projects/:projectId/tasks/:taskId/subtasks         - Create subtask
 *   PATCH  /projects/:projectId/tasks/:taskId/subtasks/:subtaskId - Update subtask
 *   PATCH  /projects/:projectId/tasks/:taskId/subtasks/:subtaskId/toggle - Toggle
 *   DELETE /projects/:projectId/tasks/:taskId/subtasks/:subtaskId - Delete subtask
 */

const { Router } = require('express');

const authenticate      = require('../../middleware/authenticate.middleware');
const authorizeRole     = require('../../middleware/authorizeRole.middleware');
const organizationScope = require('../../middleware/organizationScope.middleware');
const validateRequest   = require('../../middleware/validateRequest.middleware');
const { ROLES }         = require('../../constants/roles.constants');

const taskController = require('./tasks.controller');
const {
  validateCreateTask,
  validateUpdateTask,
  validateChangeTaskStatus,
  validateAssignTask,
  validateCreateSubtask,
  validateUpdateSubtask,
  validateListTasks,
} = require('./tasks.validation');

// mergeParams: true so :projectId from parent router is accessible
const router = Router({ mergeParams: true });

// All task routes require authentication and org scope.
router.use(authenticate, organizationScope);

// ── Tasks ──────────────────────────────────────────────────────────────────────

router.get(
  '/',
  validateListTasks, validateRequest,
  taskController.listTasks
);

router.post(
  '/',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  validateCreateTask, validateRequest,
  taskController.createTask
);

router.get('/:taskId', taskController.getTaskById);

router.patch(
  '/:taskId',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  validateUpdateTask, validateRequest,
  taskController.updateTask
);

router.patch(
  '/:taskId/status',
  validateChangeTaskStatus, validateRequest,
  taskController.changeTaskStatus
);

router.patch(
  '/:taskId/archive',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  taskController.archiveTask
);

router.patch(
  '/:taskId/restore',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  taskController.restoreTask
);

// ── Assignment ─────────────────────────────────────────────────────────────────

router.post(
  '/:taskId/assign',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  validateAssignTask, validateRequest,
  taskController.assignTask
);

router.delete(
  '/:taskId/assign',
  authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER),
  taskController.unassignTask
);

// ── Subtasks ───────────────────────────────────────────────────────────────────

router.get('/:taskId/subtasks', taskController.listSubtasks);

router.post(
  '/:taskId/subtasks',
  validateCreateSubtask, validateRequest,
  taskController.createSubtask
);

router.patch(
  '/:taskId/subtasks/:subtaskId',
  validateUpdateSubtask, validateRequest,
  taskController.updateSubtask
);

router.patch('/:taskId/subtasks/:subtaskId/toggle', taskController.toggleSubtask);

router.delete('/:taskId/subtasks/:subtaskId', taskController.deleteSubtask);

module.exports = router;
