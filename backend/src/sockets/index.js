'use strict';

/**
 * sockets/index.js
 *
 * Main WebSocket coordinator.
 * Attaches auth middleware, connection listeners, room management, and disconnects.
 */

const logger = require('../utils/logger.util');
const socketAuthMiddleware = require('./socketAuth.middleware');

function registerSocketHandlers(io) {
  // 1. Handshake authentication
  io.use(socketAuthMiddleware);

  // 2. Connection handling
  io.on('connection', (socket) => {
    const { userId, organizationId, user } = socket;
    logger.info(`[Socket.io] User connected: ${userId} (${user.email}) - Socket ID: ${socket.id}`);

    // Join personal notification room
    socket.join(`user:${userId}`);

    // Join organization-wide broadcast room
    if (organizationId) {
      socket.join(`org:${organizationId}`);
    }

    // Room subscription requests (e.g. project view, task view)
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on('join:task', (taskId) => {
      socket.join(`task:${taskId}`);
    });

    socket.on('leave:task', (taskId) => {
      socket.leave(`task:${taskId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`[Socket.io] User disconnected: ${userId} - Reason: ${reason}`);
    });
  });
}

module.exports = {
  registerSocketHandlers,
};
