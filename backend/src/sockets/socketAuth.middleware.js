'use strict';

/**
 * socketAuth.middleware.js
 *
 * Authenticates incoming WebSocket handshakes using the JWT access token.
 * Extracts user details and attaches them to `socket.user`.
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env.config');
const logger = require('../utils/logger.util');

function socketAuthMiddleware(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: Token required.'));
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret);
    socket.user = decoded;
    socket.userId = decoded.sub;
    socket.organizationId = decoded.organizationId;

    next();
  } catch (err) {
    logger.warn(`[SocketAuth] Handshake rejected: ${err.message}`);
    return next(new Error('Authentication error: Invalid or expired token.'));
  }
}

module.exports = socketAuthMiddleware;
