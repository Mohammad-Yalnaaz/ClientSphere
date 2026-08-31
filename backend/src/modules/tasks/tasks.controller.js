'use strict';

/**
 * tasks.controller.js
 *
 * Thin HTTP adapter for Task and Subtask endpoints.
 * No business logic — only extraction, delegation, and response.
 */

const asyncHandler  = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendNoContent } = require('../../utils/apiResponse.util');
const taskService   = require('./tasks.service');

// ── List Tasks ─────────────────────────────────────────────────────────────────

const listTasks = asyncHandler(async (req, res) => {
  const { search, status, priority, assignedTo, page, limit } = req.query;
  const result = await taskService.listTasks(
    req.params.projectId,
    req.organizationId,
    { search, status, priority, assignedTo, page, limit }
  );
  return sendSuccess(res, 'Tasks retrieved successfully.', { tasks: result.tasks }, 200,
    { total: result.total, page: result.page, limit: result.limit });
});

// ── Get Task ───────────────────────────────────────────────────────────────────

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.taskId, req.organizationId);
  return sendSuccess(res, 'Task retrieved successfully.', { task });
});

// ── Create Task ────────────────────────────────────────────────────────────────

const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, assignedTo } = req.body;
  const task = await taskService.createTask(
    req.params.projectId,
    req.organizationId,
    req.user._id.toString(),
    { title, description, priority, dueDate, assignedTo }
  );
  return sendCreated(res, 'Task created successfully.', { task });
});

// ── Update Task ────────────────────────────────────────────────────────────────

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.taskId, req.organizationId, req.body);
  return sendSuccess(res, 'Task updated successfully.', { task });
});

// ── Change Status ──────────────────────────────────────────────────────────────

const changeTaskStatus = asyncHandler(async (req, res) => {
  const task = await taskService.changeTaskStatus(
    req.params.taskId, req.organizationId, req.body.status
  );
  return sendSuccess(res, 'Task status updated successfully.', { task });
});

// ── Archive / Restore ──────────────────────────────────────────────────────────

const archiveTask = asyncHandler(async (req, res) => {
  const task = await taskService.archiveTask(req.params.taskId, req.organizationId);
  return sendSuccess(res, 'Task archived successfully.', { task });
});

const restoreTask = asyncHandler(async (req, res) => {
  const task = await taskService.restoreTask(req.params.taskId, req.organizationId);
  return sendSuccess(res, 'Task restored successfully.', { task });
});

// ── Assignment ─────────────────────────────────────────────────────────────────

const assignTask = asyncHandler(async (req, res) => {
  const task = await taskService.assignTask(
    req.params.taskId, req.organizationId, req.body.userId
  );
  return sendSuccess(res, 'Task assigned successfully.', { task });
});

const unassignTask = asyncHandler(async (req, res) => {
  const task = await taskService.unassignTask(req.params.taskId, req.organizationId);
  return sendSuccess(res, 'Task unassigned successfully.', { task });
});

// ── Subtasks ───────────────────────────────────────────────────────────────────

const listSubtasks = asyncHandler(async (req, res) => {
  const subtasks = await taskService.listSubtasks(req.params.taskId, req.organizationId);
  return sendSuccess(res, 'Subtasks retrieved successfully.', { subtasks });
});

const createSubtask = asyncHandler(async (req, res) => {
  const subtask = await taskService.createSubtask(
    req.params.taskId,
    req.organizationId,
    req.user._id.toString(),
    { title: req.body.title }
  );
  return sendCreated(res, 'Subtask created successfully.', { subtask });
});

const updateSubtask = asyncHandler(async (req, res) => {
  const subtask = await taskService.updateSubtask(
    req.params.subtaskId,
    req.params.taskId,
    req.organizationId,
    { title: req.body.title }
  );
  return sendSuccess(res, 'Subtask updated successfully.', { subtask });
});

const toggleSubtask = asyncHandler(async (req, res) => {
  const subtask = await taskService.toggleSubtask(
    req.params.subtaskId, req.params.taskId, req.organizationId
  );
  return sendSuccess(res, 'Subtask toggled successfully.', { subtask });
});

const deleteSubtask = asyncHandler(async (req, res) => {
  await taskService.deleteSubtask(
    req.params.subtaskId, req.params.taskId, req.organizationId
  );
  return sendNoContent(res);
});

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
