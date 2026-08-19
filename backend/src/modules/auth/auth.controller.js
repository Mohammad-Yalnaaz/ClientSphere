'use strict';

/**
 * auth.controller.js
 *
 * Thin HTTP adapter layer for authentication endpoints.
 *
 * Responsibilities:
 *  - Extract validated inputs from req.body / req.cookies.
 *  - Delegate all business logic to auth.service.js.
 *  - Set / clear the HttpOnly refresh-token cookie.
 *  - Return standardised API responses via apiResponse utilities.
 *
 * Architecture rule (ARCHITECTURE_DECISIONS.md §9):
 *  - Controllers are thin — no business logic, no direct DB access.
 *  - Every handler is wrapped in asyncHandler (Module 1) to forward
 *    any thrown AppError to the central errorHandler middleware.
 */

const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendNoContent } = require('../../utils/apiResponse.util');
const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');
const authService = require('./auth.service');

// ── Register ──────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 *
 * Creates a new Organization and its initial Administrator User.
 * Issues an access token in the response body and a refresh token
 * as an HttpOnly cookie.
 */
const register = asyncHandler(async (req, res) => {
  const { organizationName, firstName, lastName, email, password } = req.body;

  const { user, organization, accessToken, refreshToken } = await authService.register({
    organizationName,
    firstName,
    lastName,
    email,
    password,
  });

  res.cookie('refreshToken', refreshToken, authService.getRefreshCookieOptions());

  return sendCreated(res, 'Organization and administrator account created successfully.', {
    user,
    organization,
    accessToken,
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login
 *
 * Authenticates via email + password.
 * Issues tokens on success; 401 on failure.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.login({ email, password });

  res.cookie('refreshToken', refreshToken, authService.getRefreshCookieOptions());

  return sendSuccess(res, 'Login successful.', { user, accessToken });
});

// ── Google OAuth ──────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/google
 *
 * Authenticates via a Google ID token (from the frontend OAuth flow).
 * The frontend handles the Google consent screen and passes the resulting
 * idToken to this endpoint.
 */
const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  const { user, accessToken, refreshToken, isNewUser } = await authService.loginWithGoogle({
    idToken,
  });

  res.cookie('refreshToken', refreshToken, authService.getRefreshCookieOptions());

  const message = isNewUser
    ? 'Google account registered and logged in successfully.'
    : 'Google login successful.';

  return sendSuccess(res, message, { user, accessToken });
});

// ── Refresh Token ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/refresh
 *
 * Uses the HttpOnly refresh token cookie to issue a new access + refresh pair.
 * Implements token rotation: the old refresh token is invalidated and replaced.
 */
const refresh = asyncHandler(async (req, res) => {
  const currentRefreshToken = req.cookies?.refreshToken;

  const { user, accessToken, refreshToken } = await authService.refreshAccessToken(
    currentRefreshToken
  );

  res.cookie('refreshToken', refreshToken, authService.getRefreshCookieOptions());

  return sendSuccess(res, 'Token refreshed successfully.', { user, accessToken });
});

// ── Logout ────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/logout
 *
 * Clears the refresh token cookie and invalidates the server-side token.
 * Requires an authenticated session (authenticate middleware is on this route).
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id.toString());

  // Clear the HttpOnly cookie by sending an expired version.
  res.cookie('refreshToken', '', {
    ...authService.getRefreshCookieOptions(),
    maxAge: 0,
  });

  return sendNoContent(res);
});

// ── Get Current User ──────────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/me
 *
 * Returns the authenticated user's profile and organization context.
 * Requires an authenticated session.
 */
const getMe = asyncHandler(async (req, res) => {
  const { user, organization } = await authService.getCurrentUser(
    req.user._id.toString()
  );

  return sendSuccess(res, 'Current user retrieved successfully.', { user, organization });
});

module.exports = {
  register,
  login,
  googleAuth,
  refresh,
  logout,
  getMe,
};
