'use strict';

/**
 * app.js
 *
 * Express application factory.
 *
 * Creates and fully configures the Express app, including all global
 * middleware and route registration. Does NOT start the HTTP server —
 * that responsibility belongs to server.js, which allows the app to
 * be imported cleanly for integration testing without binding a port.
 *
 * Middleware stack order (order is significant):
 * 1. Security headers        – helmet
 * 2. CORS                    – cors with corsOptions
 * 3. HTTP request logging    – morgan (dev-only colorised, prod JSON via winston)
 * 4. Body parsers            – express.json, express.urlencoded
 * 5. Cookie parser           – cookie-parser (needed for HttpOnly refresh token)
 * 6. Sanitization            – express-mongo-sanitize, xss-clean, hpp
 * 7. Global rate limit       – standardApiLimiter
 * 8. API routes              – /api/v1/*
 * 9. Not-found handler       – notFound middleware
 * 10. Error handler          – errorHandler middleware (must be last)
 *
 * Design decisions:
 * - createApp() is a factory rather than a singleton so that test
 *   suites can create isolated app instances.
 * - xss-clean and express-mongo-sanitize are applied before routes
 *   so that request body, query, and params are clean before any
 *   controller or validator sees them (SRS §6.5.3).
 * - morgan streams through the Winston logger at the http level so
 *   that all output passes through a single logging channel.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const corsOptions = require('./config/cors.config');
const config = require('./config/env.config');
const logger = require('./utils/logger.util');
const { standardApiLimiter } = require('./middleware/rateLimiter.middleware');
const notFound = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');
const apiRouter = require('./routes/index');

/**
 * Creates and configures the Express application.
 *
 * @returns {import('express').Application} Configured Express app instance.
 */
function createApp() {
  const app = express();

  // ── 1. Security Headers (SRS §6.8.2) ─────────────────────────────────
  // helmet sets a sensible default set of HTTP security headers.
  app.use(helmet());

  // ── 2. CORS ──────────────────────────────────────────────────────────
  // Must appear before other middleware so that OPTIONS preflight
  // requests are handled before the body parser or rate limiter runs.
  app.use(cors(corsOptions));
  // Ensure preflight requests receive a 200 response.
  app.options('*', cors(corsOptions));

  // ── 3. HTTP Request Logging ───────────────────────────────────────────
  // 'dev' format in development for colourised one-liners.
  // 'combined' (Apache format) in production for structured access logs.
  const morganFormat = config.isDevelopment ? 'dev' : 'combined';
  app.use(morgan(morganFormat, { stream: logger.stream }));

  // ── 4. Body Parsers ───────────────────────────────────────────────────
  // 10kb JSON body limit prevents excessively large payloads.
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // ── 5. Cookie Parser ──────────────────────────────────────────────────
  // Required to read the HttpOnly refresh token cookie
  // (ARCHITECTURE_DECISIONS.md §4).
  app.use(cookieParser());

  // ── 6. Sanitization ───────────────────────────────────────────────────
  // Remove any MongoDB operator keys ($, .) injected into request data.
  app.use(mongoSanitize());

  // Prevent HTTP Parameter Pollution (e.g., ?status=active&status=archived).
  app.use(hpp());

  // ── 7. Global Rate Limiting ───────────────────────────────────────────
  // Applied to all /api routes. Sensitive endpoints have tighter
  // named limiters applied directly in their route definitions
  // (ARCHITECTURE_DECISIONS.md §7).
  app.use('/api', standardApiLimiter);

  // ── 8. API Routes ─────────────────────────────────────────────────────
  app.use('/api/v1', apiRouter);

  // ── 9. Not-Found Handler ──────────────────────────────────────────────
  // Catches any request that did not match a registered route.
  app.use(notFound);

  // ── 10. Centralised Error Handler ────────────────────────────────────
  // MUST be the last middleware registered — Express identifies it
  // by its four-parameter signature (err, req, res, next).
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
