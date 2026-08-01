'use strict';

/**
 * logger.util.js
 *
 * Application-wide structured logger built on Winston.
 *
 * Design decisions:
 * - Winston is used over console.log for log levels, structured
 *   metadata, and transport control (stdout vs file).
 * - In development: human-readable colorised output to console.
 * - In production: JSON-formatted output (structured logs) suitable
 *   for ingestion by cloud log aggregators (e.g., Render log streams).
 * - HTTP request logging is handled separately by morgan in app.js,
 *   which writes to this logger's http level.
 *
 * Levels (from low to high severity):
 *   error, warn, info, http, verbose, debug, silly
 */

const { createLogger, format, transports } = require('winston');
const config = require('../config/env.config');

const { combine, timestamp, printf, colorize, errors, json } = format;

/**
 * Human-readable log format for development environments.
 * Example: 2024-01-15 10:23:45 [INFO]: Server started on port 5000
 */
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${ts} [${level}]: ${stack || message}${metaStr}`;
  })
);

/**
 * Structured JSON format for production.
 * Includes full error stacks in the `stack` field.
 */
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

/**
 * Minimum log level based on environment.
 * http level captures morgan HTTP request logs.
 */
const level = config.isDevelopment ? 'debug' : 'info';

const logger = createLogger({
  level,
  format: config.isProduction ? prodFormat : devFormat,
  transports: [
    new transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

/**
 * Morgan stream adapter — allows morgan HTTP request logs to flow
 * through Winston at the http level.
 */
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
