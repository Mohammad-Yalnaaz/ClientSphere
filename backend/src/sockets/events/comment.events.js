'use strict';

/**
 * comment.events.js
 *
 * Real-time event helpers for new comments on tasks or projects.
 */

const { getIO } = require('../../config/socket.config');

function emitCommentCreated(entityType, entityId, comment) {
  const io = getIO();
  if (!io) return;
  io.to(`${entityType.toLowerCase()}:${entityId}`).emit('comment:created', comment);
}

function emitCommentDeleted(entityType, entityId, commentId) {
  const io = getIO();
  if (!io) return;
  io.to(`${entityType.toLowerCase()}:${entityId}`).emit('comment:deleted', { commentId });
}

module.exports = {
  emitCommentCreated,
  emitCommentDeleted,
};
