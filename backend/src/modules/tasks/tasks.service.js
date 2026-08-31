'use strict';

/**
 * tasks.service.js
 *
 * Business logic for all Task and Subtask management operations.
 *
 * Group A — Task CRUD: listTasks, getTaskById, createTask, updateTask
 * Group B — Task lifecycle: changeTaskStatus, archiveTask, restoreTask
 * Group C — Task assignment: assignTask, unassignTask
 * Group D — Subtask CRUD: listSubtasks, createSubtask, updateSubtask, deleteSubtask, toggleSubtask
 *
 * Architecture (ARCHITECTURE_DECISIONS.md §9):
 *  - Calls repositories only.
 *  - Throws AppError for all operational failures.
 *  - No req / res / next.
 *
 * Note on FR-TASK-026 (Audit Logging): wired in Module 12.
 */

const AppError = require('../../utils/appError.util');
const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');
const logger = require('../../utils/logger.util');

const taskRepo    = require('./tasks.repository');
const projectRepo = require('../projects/projects.repository');
const { TASK_STATUSES, TASK_PRIORITIES, VALID_TASK_TRANSITIONS } = require('./tasks.constants');

// ── Helper: verify project exists + user has access ──────────────────────────

async function assertProjectAccess(projectId, organizationId) {
  const project = await projectRepo.findProjectById(projectId, organizationId);
  if (!project) {
    throw new AppError('Project not found.', HTTP_STATUS.NOT_FOUND);
  }
  return project;
}

// ── Helper: verify task exists in org ────────────────────────────────────────

async function assertTaskExists(taskId, organizationId) {
  const task = await taskRepo.findTaskById(taskId, organizationId);
  if (!task) {
    throw new AppError('Task not found.', HTTP_STATUS.NOT_FOUND);
  }
  return task;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP A — TASK CRUD
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lists tasks within a project with search, filter, and pagination.
 * (FR-TASK-019, FR-TASK-020, FR-TASK-021)
 *
 * @param {string} projectId
 * @param {string} organizationId
 * @param {object} query
 */
async function listTasks(projectId, organizationId, query = {}) {
  await assertProjectAccess(projectId, organizationId);

  const { search, status, priority, assignedTo, page = 1, limit = 20 } = query;
  const filter = { projectId, organizationId };

  if (status && Object.values(TASK_STATUSES).includes(status)) filter.status = status;
  if (priority && Object.values(TASK_PRIORITIES).includes(priority)) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;

  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = new RegExp(escaped, 'i');
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [tasks, total] = await Promise.all([
    taskRepo.findTasks(filter, { skip, limit: Number(limit) }),
    taskRepo.countTasks(filter),
  ]);

  return {
    tasks: tasks.map(t => t.toJSON()),
    total,
    page: Number(page),
    limit: Number(limit),
  };
}

/**
 * Gets a single task by ID.
 * Includes subtask list and completion stats for progress display.
 * (FR-TASK-017)
 *
 * @param {string} taskId
 * @param {string} organizationId
 */
async function getTaskById(taskId, organizationId) {
  const task = await assertTaskExists(taskId, organizationId);
  const subtasks = await taskRepo.findSubtasksByTask(taskId);
  const total = subtasks.length;
  const completed = subtasks.filter(s => s.isCompleted).length;

  return {
    ...task.toJSON(),
    subtasks: subtasks.map(s => s.toJSON()),
    progress: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/**
 * Creates a new Task within a project.
 * (FR-TASK-001, FR-TASK-010, FR-TASK-011, FR-TASK-023)
 *
 * @param {string} projectId
 * @param {string} organizationId
 * @param {string} createdBy
 * @param {object} data
 */
async function createTask(projectId, organizationId, createdBy, data) {
  await assertProjectAccess(projectId, organizationId);

  // Validate assignee is a project member (FR-TASK-023)
  if (data.assignedTo) {
    const project = await projectRepo.findProjectById(projectId, organizationId);
    const isMember = project.members.map(String).includes(String(data.assignedTo)) ||
                     project.managers.map(String).includes(String(data.assignedTo));
    if (!isMember) {
      throw new AppError(
        'Assigned user is not a member of this project.',
        HTTP_STATUS.UNPROCESSABLE_ENTITY
      );
    }
  }

  const task = await taskRepo.createTask({
    organizationId,
    projectId,
    createdBy,
    title: data.title.trim(),
    description: data.description || null,
    assignedTo: data.assignedTo || null,
    priority: data.priority || TASK_PRIORITIES.MEDIUM,
    status: TASK_STATUSES.TODO,
    dueDate: data.dueDate || null,
  });

  logger.info(`Task created: ${task.title} (${task._id}) in project ${projectId}`);
  return task.toJSON();
}

/**
 * Updates a task's editable fields.
 * projectId is immutable (FR-TASK-011).
 * (FR-TASK-002, FR-TASK-012, FR-TASK-013)
 *
 * @param {string} taskId
 * @param {string} organizationId
 * @param {object} updates
 */
async function updateTask(taskId, organizationId, updates) {
  await assertTaskExists(taskId, organizationId);

  const allowed = ['title', 'description', 'priority', 'dueDate'];
  const fields = {};
  allowed.forEach(f => { if (updates[f] !== undefined) fields[f] = updates[f]; });

  const task = await taskRepo.updateTaskById(taskId, fields);
  logger.info(`Task updated: ${taskId}`);
  return task.toJSON();
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP B — TASK LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Changes a task's status with transition validation.
 * (FR-TASK-014, FR-TASK-016, FR-TASK-024)
 *
 * @param {string} taskId
 * @param {string} organizationId
 * @param {string} newStatus
 */
async function changeTaskStatus(taskId, organizationId, newStatus) {
  const task = await assertTaskExists(taskId, organizationId);

  if (task.status === newStatus) {
    throw new AppError(`Task is already in ${newStatus} status.`, HTTP_STATUS.CONFLICT);
  }

  // Enforce valid transition (FR-TASK-024)
  const allowed = VALID_TASK_TRANSITIONS[task.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new AppError(
      `Cannot transition task from ${task.status} to ${newStatus}.`,
      HTTP_STATUS.UNPROCESSABLE_ENTITY
    );
  }

  const updates = { status: newStatus };

  // Set completedAt when marking complete (FR-TASK-016)
  if (newStatus === TASK_STATUSES.COMPLETED) {
    updates.completedAt = new Date();
  } else if (task.status === TASK_STATUSES.COMPLETED) {
    updates.completedAt = null;
  }

  const updated = await taskRepo.updateTaskById(taskId, updates);
  logger.info(`Task status changed: ${taskId} → ${newStatus}`);
  return updated.toJSON();
}

/**
 * Archives a task — status = ARCHIVED.
 * (FR-TASK-003)
 *
 * @param {string} taskId
 * @param {string} organizationId
 */
async function archiveTask(taskId, organizationId) {
  const task = await assertTaskExists(taskId, organizationId);

  if (task.status === TASK_STATUSES.ARCHIVED) {
    throw new AppError('Task is already archived.', HTTP_STATUS.CONFLICT);
  }

  const updated = await taskRepo.updateTaskById(taskId, { status: TASK_STATUSES.ARCHIVED });
  logger.info(`Task archived: ${taskId}`);
  return updated.toJSON();
}

/**
 * Restores an archived task to TODO.
 * (FR-TASK-004)
 *
 * @param {string} taskId
 * @param {string} organizationId
 */
async function restoreTask(taskId, organizationId) {
  const task = await assertTaskExists(taskId, organizationId);

  if (task.status !== TASK_STATUSES.ARCHIVED) {
    throw new AppError('Only archived tasks can be restored.', HTTP_STATUS.CONFLICT);
  }

  const updated = await taskRepo.updateTaskById(taskId, { status: TASK_STATUSES.TODO });
  logger.info(`Task restored: ${taskId}`);
  return updated.toJSON();
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP C — TASK ASSIGNMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Assigns or reassigns a task to a project member.
 * (FR-TASK-007, FR-TASK-008, FR-TASK-023)
 *
 * @param {string} taskId
 * @param {string} organizationId
 * @param {string} userId
 */
async function assignTask(taskId, organizationId, userId) {
  const task = await assertTaskExists(taskId, organizationId);

  // Validate user is a project member (FR-TASK-023)
  const project = await projectRepo.findProjectById(task.projectId, organizationId);
  const isMember = project.members.map(String).includes(String(userId)) ||
                   project.managers.map(String).includes(String(userId));
  if (!isMember) {
    throw new AppError(
      'User is not a member of the project this task belongs to.',
      HTTP_STATUS.UNPROCESSABLE_ENTITY
    );
  }

  const updated = await taskRepo.updateTaskById(taskId, { assignedTo: userId });
  logger.info(`Task assigned: ${taskId} → user ${userId}`);
  return updated.toJSON();
}

/**
 * Removes the assignment from a task.
 *
 * @param {string} taskId
 * @param {string} organizationId
 */
async function unassignTask(taskId, organizationId) {
  await assertTaskExists(taskId, organizationId);
  const updated = await taskRepo.updateTaskById(taskId, { assignedTo: null });
  logger.info(`Task unassigned: ${taskId}`);
  return updated.toJSON();
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP D — SUBTASK CRUD
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lists all subtasks for a task.
 * (FR-TASK-005, FR-TASK-009)
 */
async function listSubtasks(taskId, organizationId) {
  await assertTaskExists(taskId, organizationId);
  const subtasks = await taskRepo.findSubtasksByTask(taskId);
  return subtasks.map(s => s.toJSON());
}

/**
 * Creates a new subtask within a task.
 * (FR-TASK-005)
 */
async function createSubtask(taskId, organizationId, createdBy, data) {
  await assertTaskExists(taskId, organizationId);

  const subtask = await taskRepo.createSubtask({
    organizationId,
    taskId,
    createdBy,
    title: data.title.trim(),
    isCompleted: false,
  });

  logger.info(`Subtask created: ${subtask.title} (${subtask._id}) in task ${taskId}`);
  return subtask.toJSON();
}

/**
 * Updates a subtask's title.
 * (FR-TASK-006)
 */
async function updateSubtask(subtaskId, taskId, organizationId, updates) {
  const subtask = await taskRepo.findSubtaskById(subtaskId, taskId);
  if (!subtask) throw new AppError('Subtask not found.', HTTP_STATUS.NOT_FOUND);

  const fields = {};
  if (updates.title !== undefined) fields.title = updates.title.trim();

  const updated = await taskRepo.updateSubtaskById(subtaskId, fields);
  return updated.toJSON();
}

/**
 * Toggles a subtask's completion state.
 * (FR-TASK-006, FR-TASK-017)
 */
async function toggleSubtask(subtaskId, taskId, organizationId) {
  const subtask = await taskRepo.findSubtaskById(subtaskId, taskId);
  if (!subtask) throw new AppError('Subtask not found.', HTTP_STATUS.NOT_FOUND);

  const isCompleted = !subtask.isCompleted;
  const updated = await taskRepo.updateSubtaskById(subtaskId, {
    isCompleted,
    completedAt: isCompleted ? new Date() : null,
  });

  return updated.toJSON();
}

/**
 * Deletes a subtask permanently.
 * (Subtasks don't have an archived state — they're simple checkboxes.)
 */
async function deleteSubtask(subtaskId, taskId, organizationId) {
  await assertTaskExists(taskId, organizationId);
  const subtask = await taskRepo.findSubtaskById(subtaskId, taskId);
  if (!subtask) throw new AppError('Subtask not found.', HTTP_STATUS.NOT_FOUND);

  await taskRepo.deleteSubtaskById(subtaskId);
  logger.info(`Subtask deleted: ${subtaskId}`);
}

module.exports = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  changeTaskStatus,
  archiveTask,
  restoreTask,
  assignTask,
  unassignTask,
  listSubtasks,
  createSubtask,
  updateSubtask,
  toggleSubtask,
  deleteSubtask,
};
