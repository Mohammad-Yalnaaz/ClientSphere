'use strict';

/**
 * project.events.js
 *
 * Real-time event helpers for project status changes and updates.
 */

const { getIO } = require('../../config/socket.config');

function emitProjectUpdated(organizationId, project) {
  const io = getIO();
  if (!io) return;
  io.to(`org:${organizationId}`).emit('project:updated', project);
}

module.exports = {
  emitProjectUpdated,
};
