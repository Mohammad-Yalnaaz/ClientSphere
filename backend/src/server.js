'use strict';

/**
 * server.js
 *
 * Application bootstrap entry point.
 *
 * Responsibilities:
 * 1. Validate environment variables (via env.config.js require).
 * 2. Connect to MongoDB.
 * 3. Create the Express application.
 * 4. Start the HTTP server.
 * 5. Handle graceful shutdown on SIGTERM and SIGINT.
 *
 * Design decisions:
 * - Environment validation (env.config.js require) happens before
 *   any other module so that missing variables cause an immediate,
 *   clear exit rather than a cryptic runtime failure during a request.
 * - MongoDB is connected before the HTTP server begins accepting
 *   traffic, ensuring no request is handled without a database
 *   connection.
 * - Graceful shutdown (SIGTERM / SIGINT) closes the HTTP server and
 *   MongoDB connection cleanly before exiting, satisfying SRS NFR-4
 *   (availability and graceful degradation).
 * - Unhandled promise rejections and uncaught exceptions are caught
 *   at the process level to prevent silent failures and ensure they
 *   are logged before the process exits.
 */

// env.config.js validates required environment variables immediately
// on require. If any are missing the process exits here with a clear
// message before any server infrastructure is initialised.
const config = require('./config/env.config');
const logger = require('./utils/logger.util');
const { connectDatabase, disconnectDatabase } = require('./config/database.config');
const createApp = require('./app');

// ─── Process-Level Error Guards ────────────────────────────────────────────────
// Catch any unhandled rejection that escapes asyncHandler + errorHandler.
// Log and initiate graceful shutdown rather than silently hanging.

process.on('unhandledRejection', (reason, promise) => {
  logger.error('[Process] Unhandled Promise Rejection:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  logger.warn('[Process] Initiating graceful shutdown due to unhandled rejection.');
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error('[Process] Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
  });
  logger.warn('[Process] Initiating graceful shutdown due to uncaught exception.');
  // Do not attempt graceful shutdown on uncaught exception — the process
  // state is unknown. Exit immediately to prevent further corruption.
  process.exit(1);
});

// ─── HTTP Server Reference (for graceful shutdown) ─────────────────────────────
let httpServer;

/**
 * Performs a graceful shutdown: stops accepting new connections,
 * closes the existing server, and disconnects from MongoDB.
 *
 * @param {string} signal - The OS signal or event that triggered shutdown.
 */
async function gracefulShutdown(signal) {
  logger.info(`[Server] Received ${signal}. Starting graceful shutdown...`);

  if (httpServer) {
    await new Promise((resolve) => {
      httpServer.close((err) => {
        if (err) {
          logger.error('[Server] Error closing HTTP server:', { message: err.message });
        } else {
          logger.info('[Server] HTTP server closed. No longer accepting connections.');
        }
        resolve();
      });
    });
  }

  try {
    await disconnectDatabase();
  } catch (err) {
    logger.error('[Server] Error during database disconnection:', { message: err.message });
  }

  logger.info('[Server] Graceful shutdown complete. Exiting process.');
  process.exit(0);
}

// ─── Bootstrap ─────────────────────────────────────────────────────────────────

/**
 * Starts the ClientSphere backend server.
 * Steps: connect DB → create app → listen.
 */
async function bootstrap() {
  try {
    // Step 1 — Connect to MongoDB
    await connectDatabase();

    // Step 1b — Configure Cloudinary for file uploads
    const { configureCloudinary } = require('./config/cloudinary.config');
    configureCloudinary();

    // Step 2 — Build the Express application
    const app = createApp();

    // Step 3 — Start the HTTP server
    const port = config.port;

    httpServer = app.listen(port, () => {
      logger.info(`[Server] ClientSphere API is running.`, {
        environment: config.env,
        port,
        url: `http://localhost:${port}/api/v1/health`,
      });
    });

    // Increase the keep-alive and header timeout beyond the default 5 s
    // to prevent premature connection drops under Render's load balancer.
    httpServer.keepAliveTimeout = 65_000;
    httpServer.headersTimeout = 70_000;
  } catch (error) {
    logger.error('[Server] Bootstrap failed. Exiting.', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// ─── Graceful Shutdown Signal Handlers ────────────────────────────────────────

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ─── Run ───────────────────────────────────────────────────────────────────────
bootstrap();
