'use strict';

/**
 * auth.routes.js
 *
 * Route definitions for the Authentication module.
 *
 * Route layout:
 *   POST   /register  – Register new organization + admin (public)
 *   POST   /login     – Credential-based login             (public)
 *   POST   /google    – Google OAuth login                 (public)
 *   POST   /refresh   – Rotate refresh token               (public, cookie-auth)
 *   POST   /logout    – Terminate session                  (protected)
 *   GET    /me        – Get current user profile           (protected)
 *
 * Protected routes use the authenticate middleware implemented in this
 * module (Module 2) to verify the Bearer access token before the
 * controller runs.
 *
 * The authRateLimiter is tighter than the global limiter to harden
 * login and registration endpoints against brute-force attacks
 * (ARCHITECTURE_DECISIONS.md §7).
 */

const { Router } = require('express');
const rateLimit = require('express-rate-limit');

const authenticate = require('../../middleware/authenticate.middleware');
const validateRequest = require('../../middleware/validateRequest.middleware');

const authController = require('./auth.controller');
const {
  validateRegister,
  validateLogin,
  validateGoogleAuth,
  validateRefresh,
} = require('./auth.validation');

const router = Router();

// ── Auth-specific rate limiter ─────────────────────────────────────────────────
// Applied to all auth routes, stricter than the global limiter.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 auth requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
  skipSuccessfulRequests: false,
});

// Apply the auth rate limiter to every route in this router.
router.use(authRateLimiter);

// ── Public routes ──────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Register a new organization and its initial administrator.
 */
router.post(
  '/register',
  validateRegister,
  validateRequest,
  authController.register
);

/**
 * POST /api/v1/auth/login
 * Credential-based login (email + password).
 */
router.post(
  '/login',
  validateLogin,
  validateRequest,
  authController.login
);

/**
 * POST /api/v1/auth/google
 * Google OAuth login via ID token from the frontend.
 */
router.post(
  '/google',
  validateGoogleAuth,
  validateRequest,
  authController.googleAuth
);

/**
 * POST /api/v1/auth/refresh
 * Rotate the refresh token (reads from HttpOnly cookie).
 */
router.post(
  '/refresh',
  validateRefresh,
  validateRequest,
  authController.refresh
);

// ── Protected routes ───────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/logout
 * Terminate the authenticated session.
 */
router.post('/logout', authenticate, authController.logout);

/**
 * GET /api/v1/auth/me
 * Return the currently authenticated user's profile + organization.
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
