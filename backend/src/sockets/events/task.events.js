'use strict';

/**
 * task.events.js
 *
 * Real-time event helpers for task updates, status transitions, and assignments.
 */

const { getIO } = require('../../config/socket.config');

function emitTaskCreated(projectId, task) {
  const io = getIO();
  if (!io) return;
  io.to(`project:${projectId}`).emit('task:created', task);
}

function emitTaskUpdated(projectId, task) {
  const io = getIO();
  if (!io) return;
  io.to(`project:${projectId}`).emit('task:updated', task);
}

function emitTaskStatusChanged(projectId, task) {
  const io = getIO();
  if (!io) return;
  io.to(`project:${projectId}`).emit('task:status_changed', task);
}

module.exports = {
  emitTaskCreated,
  emitTaskUpdated,
  emitTaskStatusChanged,
};
