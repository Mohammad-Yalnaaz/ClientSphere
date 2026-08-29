'use strict';

/**
 * tasks.repository.js
 *
 * All database access operations for Task and Subtask entities.
 * No business logic — only Mongoose queries.
 *
 * Part A — Task read operations
 * Part B — Task write operations
 * Part C — Subtask operations
 */

const Task    = require('./tasks.model');
const Subtask = require('./subtask.model');

// ═══════════════════════════════════════════════════════════════════════════════
// PART A — TASK READ OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function findTask(filter) {
  return Task.findOne(filter);
}

async function findTaskById(taskId, organizationId) {
  return Task.findOne({ _id: taskId, organizationId });
}

async function findTasks(filter, options = {}) {
  const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
  return Task.find(filter).skip(skip).limit(limit).sort(sort);
}

async function countTasks(filter) {
  return Task.countDocuments(filter);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART B — TASK WRITE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function createTask(data) {
  return Task.create(data);
}

async function updateTaskById(taskId, updates) {
  return Task.findByIdAndUpdate(
    taskId,
    { $set: updates },
    { new: true, runValidators: true }
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART C — SUBTASK OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function findSubtasksByTask(taskId) {
  return Subtask.find({ taskId }).sort({ createdAt: 1 });
}

async function findSubtaskById(subtaskId, taskId) {
  return Subtask.findOne({ _id: subtaskId, taskId });
}

async function createSubtask(data) {
  return Subtask.create(data);
}

async function updateSubtaskById(subtaskId, updates) {
  return Subtask.findByIdAndUpdate(
    subtaskId,
    { $set: updates },
    { new: true, runValidators: true }
  );
}

async function deleteSubtaskById(subtaskId) {
  return Subtask.findByIdAndDelete(subtaskId);
}

async function countSubtasksByTask(taskId) {
  return Subtask.countDocuments({ taskId });
}

async function countCompletedSubtasksByTask(taskId) {
  return Subtask.countDocuments({ taskId, isCompleted: true });
}

module.exports = {
  // Task read
  findTask,
  findTaskById,
  findTasks,
  countTasks,
  // Task write
  createTask,
  updateTaskById,
  // Subtask
  findSubtasksByTask,
  findSubtaskById,
  createSubtask,
  updateSubtaskById,
  deleteSubtaskById,
  countSubtasksByTask,
  countCompletedSubtasksByTask,
};
