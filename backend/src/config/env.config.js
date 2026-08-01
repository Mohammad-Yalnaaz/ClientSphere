'use strict';

/**
 * env.config.js
 *
 * Single source of truth for all environment variables.
 *
 * Validates required variables at process startup and fails fast
 * with an explicit, actionable error rather than allowing cryptic
 * undefined-value failures deeper in the request lifecycle.
 *
 * The returned config object is frozen to prevent accidental mutation
 * at runtime. All modules must import from this file — never from
 * process.env directly.
 */

require('dotenv').config();

/**
 * Asserts that all required environment variable names are present
 * and non-empty in process.env. Throws on the first missing variable.
 *
 * @param {string[]} requiredVars - Array of required variable names.
 * @throws {Error} If any required variable is absent or empty.
 */
function assertRequiredVars(requiredVars) {
  const missing = requiredVars.filter(
    (key) => !process.env[key] || process.env[key].trim() === ''
  );

  if (missing.length > 0) {
    throw new Error(
      `[env.config] Missing required environment variables:\n  ${missing.join('\n  ')}\n` +
        'Copy .env.example to .env and fill in the missing values.'
    );
  }
}

// Variables that MUST be set before the application can start.
const REQUIRED_VARS = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

assertRequiredVars(REQUIRED_VARS);

/**
 * Parses a comma-separated string of origins into a trimmed array.
 *
 * @param {string|undefined} raw - Raw comma-separated origin string.
 * @returns {string[]} Array of origin strings.
 */
function parseAllowedOrigins(raw) {
  if (!raw) return ['http://localhost:5173'];
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

/**
 * Application configuration derived from environment variables.
 * All values are read once at startup; the object is immutable thereafter.
 */
const config = Object.freeze({
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  // MongoDB
  mongodb: Object.freeze({
    uri: process.env.MONGODB_URI,
  }),

  // JWT (ARCHITECTURE_DECISIONS.md §4)
  jwt: Object.freeze({
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  }),

  // Google OAuth
  google: Object.freeze({
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:5000/api/v1/auth/google/callback',
  }),

  // Cloudinary (ARCHITECTURE_DECISIONS.md §2)
  cloudinary: Object.freeze({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  }),

  // Google Gemini API
  gemini: Object.freeze({
    apiKey: process.env.GEMINI_API_KEY || '',
  }),

  // Redis / BullMQ
  redis: Object.freeze({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  }),

  // Email / SMTP
  email: Object.freeze({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.EMAIL_FROM_NAME || 'ClientSphere',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'no-reply@clientsphere.io',
  }),

  // CORS
  cors: Object.freeze({
    allowedOrigins: parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS),
  }),

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Rate Limiting
  rateLimit: Object.freeze({
    windowMinutes: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 15,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  }),
});

module.exports = config;
