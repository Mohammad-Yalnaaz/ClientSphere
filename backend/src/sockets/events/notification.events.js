'use strict';

/**
 * notification.events.js
 *
 * Real-time event helpers for user-scoped notifications (FR-NOTIFY-015).
 */

const { getIO } = require('../../config/socket.config');

function emitNotification(recipientId, notification) {
  const io = getIO();
  if (!io) return;
  io.to(`user:${recipientId}`).emit('notification:new', notification);
}

module.exports = {
  emitNotification,
};
