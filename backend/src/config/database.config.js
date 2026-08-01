'use strict';

/**
 * database.config.js
 *
 * Encapsulates MongoDB connection logic using Mongoose.
 * Exports a single async connectDatabase() function called once
 * from server.js during application bootstrap.
 *
 * Connection lifecycle events are logged for observability (NFR-4).
 * The function rejects on initial connection failure so the process
 * exits cleanly with a meaningful error rather than running in a
 * degraded state with no database.
 */

const mongoose = require('mongoose');
const config = require('./env.config');
const logger = require('../utils/logger.util');

/**
 * Establishes a Mongoose connection to MongoDB using the URI
 * from env.config. Sets recommended Mongoose options.
 *
 * @returns {Promise<void>} Resolves when the connection is ready.
 * @throws {Error} If the initial connection cannot be established.
 */
async function connectDatabase() {
  mongoose.set('strictQuery', true);

  // Attach persistent lifecycle event listeners before connecting
  // so they fire on reconnection as well as the initial connect.
  mongoose.connection.on('connected', () => {
    logger.info('[MongoDB] Connection established successfully.');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`[MongoDB] Connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('[MongoDB] Connection lost. Mongoose will attempt to reconnect.');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('[MongoDB] Connection re-established.');
  });

  try {
    await mongoose.connect(config.mongodb.uri, {
      // Prefer the newer SCRAM-SHA-256 auth mechanism
      authSource: 'admin',
    });
  } catch (error) {
    logger.error(`[MongoDB] Initial connection failed: ${error.message}`);
    throw error;
  }
}

/**
 * Gracefully closes the Mongoose connection.
 * Called during SIGTERM / SIGINT handling in server.js.
 *
 * @returns {Promise<void>}
 */
async function disconnectDatabase() {
  try {
    await mongoose.connection.close();
    logger.info('[MongoDB] Connection closed gracefully.');
  } catch (error) {
    logger.error(`[MongoDB] Error while closing connection: ${error.message}`);
    throw error;
  }
}

module.exports = { connectDatabase, disconnectDatabase };
