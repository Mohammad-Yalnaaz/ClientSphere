'use strict';

/**
 * socket.config.js
 *
 * Socket.io server configuration and initialization.
 * Configures CORS matching frontend origin.
 */

const { Server } = require('socket.io');
const config = require('./env.config');
const logger = require('../utils/logger.util');

let io = null;

function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  logger.info('[Socket.io] Real-time server initialized.');
  return io;
}

function getIO() {
  return io;
}

module.exports = {
  initSocketServer,
  getIO,
};
