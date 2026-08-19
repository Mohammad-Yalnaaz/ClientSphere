'use strict';

/**
 * auth.service.js
 *
 * Business logic for all authentication and session management operations.
 *
 * Responsibilities:
 *  - Register a new Organization with its initial Administrator.
 *  - Log in via email/password (credential-based).
 *  - Log in / provision accounts via Google OAuth.
 *  - Issue, rotate, and validate JWT access + refresh tokens.
 *  - Log out (clear stored refresh token).
 *  - Get the current authenticated User's full profile.
 *
 * Architecture (ARCHITECTURE_DECISIONS.md §9):
 *  - This service calls repositories — never Mongoose models directly.
 *  - It throws AppError for operational failures; the errorHandler
 *    middleware catches and formats them.
 *  - It never touches req / res / next — those are controller concerns.
 *
 * JWT strategy (ARCHITECTURE_DECISIONS.md §4):
 *  - Access token: 15-minute expiry, signed with JWT_ACCESS_SECRET.
 *  - Refresh token: 7-day expiry, signed with JWT_REFRESH_SECRET,
 *    stored as an HttpOnly cookie.
 *  - The refresh token's hash is persisted on the User document so that
 *    logout (and future token rotation) can invalidate it server-side.
 *
 * Google OAuth strategy:
 *  - Uses googleapis OAuth2Client to verify Google ID tokens.
 *  - On first login: provisions a new User (no password) linked to an
 *    existing Organization by the email domain or an explicit orgId.
 *  - On subsequent logins: resolves existing User by googleId or email.
 *  - Account linking: if a credential-registered User logs in via Google
 *    with the same email, the googleId is linked to their existing account.
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { google } = require('googleapis');

const config = require('../../config/env.config');
const AppError = require('../../utils/appError.util');
const logger = require('../../utils/logger.util');
const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');
const { ROLES } = require('../../constants/roles.constants');

const orgRepo = require('../organizations/organizations.repository');
const userRepo = require('../users/users.repository');

// ── JWT helpers ───────────────────────────────────────────────────────────────

/**
 * Signs a short-lived access token encoding the user's id, org, and role.
 *
 * @param {import('mongoose').Document} user
 * @returns {string} Signed JWT string.
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      organizationId: user.organizationId.toString(),
      role: user.role,
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn } // default '15m'
  );
}

/**
 * Signs a long-lived refresh token containing only the user id.
 *
 * @param {import('mongoose').Document} user
 * @returns {string} Signed JWT string.
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString() },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn } // default '7d'
  );
}

/**
 * Verifies an access token and returns its decoded payload.
 *
 * @param {string} token
 * @returns {object} Decoded payload.
 * @throws {AppError} 401 if invalid or expired.
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Access token has expired.', HTTP_STATUS.UNAUTHORIZED);
    }
    throw new AppError('Invalid access token.', HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Verifies a refresh token and returns its decoded payload.
 *
 * @param {string} token
 * @returns {object} Decoded payload.
 * @throws {AppError} 401 if invalid or expired.
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError(
        'Refresh token has expired. Please log in again.',
        HTTP_STATUS.UNAUTHORIZED
      );
    }
    throw new AppError('Invalid refresh token.', HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Returns cookie options for the refresh token HttpOnly cookie.
 * Secure flag is only set in production to allow HTTP in development.
 *
 * @returns {object} Express cookie options.
 */
function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };
}

/**
 * Hashes a refresh token for safe storage in MongoDB.
 *
 * @param {string} token
 * @returns {Promise<string>}
 */
async function hashRefreshToken(token) {
  return bcrypt.hash(token, 10);
}

/**
 * Compares a plain refresh token against its stored hash.
 *
 * @param {string} plainToken
 * @param {string} hashedToken
 * @returns {Promise<boolean>}
 */
async function compareRefreshToken(plainToken, hashedToken) {
  return bcrypt.compare(plainToken, hashedToken);
}

/**
 * Issues an access + refresh token pair for the given user and persists
 * the hashed refresh token to the DB.
 *
 * @param {import('mongoose').Document} user - The authenticated User document.
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
async function issueTokenPair(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store hashed refresh token so we can invalidate it on logout / rotation.
  const hashedRefresh = await hashRefreshToken(refreshToken);
  await userRepo.updateUserById(user._id, { refreshToken: hashedRefresh });

  return { accessToken, refreshToken };
}

// ── Public service methods ─────────────────────────────────────────────────────

/**
 * Registers a new Organization together with its initial Administrator User.
 * (FR-AUTH-001, FR-AUTH-002, FR-ORG-001)
 *
 * The registration creates:
 *  1. An Organization document.
 *  2. An Administrator User linked to that Organization.
 *  3. An authenticated session (token pair) for the new admin.
 *
 * @param {object} params
 * @param {string} params.organizationName
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {string} params.email
 * @param {string} params.password
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 * @throws {AppError} 409 if email already exists.
 */
async function register({ organizationName, firstName, lastName, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check for duplicate email globally (an admin registers a brand-new org,
  // so no org exists yet — check by email alone).
  const existingUser = await userRepo.findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new AppError(
      'An account with this email address already exists.',
      HTTP_STATUS.CONFLICT
    );
  }

  // 1. Create the Organization.
  const organization = await orgRepo.createOrganization({ name: organizationName });

  // 2. Create the Administrator User.
  // The password pre-save hook in the model hashes the password automatically.
  const user = await userRepo.createUser({
    organizationId: organization._id,
    firstName,
    lastName,
    email: normalizedEmail,
    password,
    role: ROLES.ADMINISTRATOR,
    isActive: true,
  });

  // 3. Issue session tokens.
  const { accessToken, refreshToken } = await issueTokenPair(user);

  logger.info(`New organization registered: ${organization.name} (${organization._id})`);

  // Return the user without sensitive fields (toJSON handles this on the model).
  return { user: user.toJSON(), organization: organization.toJSON(), accessToken, refreshToken };
}

/**
 * Authenticates a User via email and password.
 * (FR-AUTH-003, FR-AUTH-004)
 *
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.password
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 * @throws {AppError} 401 on invalid credentials or inactive account.
 */
async function login({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  // Load user with password field for comparison.
  const user = await userRepo.findUserByEmail(normalizedEmail, '+password');

  // Use a generic error message to avoid email enumeration (SRS §5.3.3).
  const invalidCredentialsError = new AppError(
    'Invalid email or password.',
    HTTP_STATUS.UNAUTHORIZED
  );

  if (!user) {
    throw invalidCredentialsError;
  }

  // User registered via Google OAuth — has no password.
  if (!user.password) {
    throw new AppError(
      'This account uses Google Sign-In. Please log in with Google.',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const passwordMatches = await user.isPasswordMatch(password);
  if (!passwordMatches) {
    throw invalidCredentialsError;
  }

  // Reject deactivated accounts (FR-AUTH-016, SRS §5.3.3).
  if (!user.isActive) {
    throw new AppError(
      'Your account has been deactivated. Please contact your administrator.',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const { accessToken, refreshToken } = await issueTokenPair(user);

  logger.info(`User login: ${user.email} (${user._id})`);

  return { user: user.toJSON(), accessToken, refreshToken };
}

/**
 * Authenticates or provisions a User via Google OAuth.
 * (FR-AUTH-005, FR-AUTH-006)
 *
 * Flow:
 *  1. Verify the Google ID token via googleapis.
 *  2. Look up the User by googleId — if found, log in.
 *  3. If not found by googleId, check by email:
 *     a. If email exists → link the googleId to the existing account.
 *     b. If email does not exist → provisioning is not supported without
 *        an org context; throw 404 directing the user to register.
 *  4. Issue token pair.
 *
 * @param {object} params
 * @param {string} params.idToken - The Google ID token from the OAuth callback.
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string, isNewUser: boolean }>}
 * @throws {AppError} on invalid token or deactivated account.
 */
async function loginWithGoogle({ idToken }) {
  // Step 1: Verify Google ID token.
  const client = new google.auth.OAuth2(config.google.clientId);

  let googlePayload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });
    googlePayload = ticket.getPayload();
  } catch (err) {
    logger.warn(`Google OAuth token verification failed: ${err.message}`);
    throw new AppError(
      'Google authentication failed. Please try again.',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const { sub: googleId, email, given_name: firstName, family_name: lastName } = googlePayload;
  const normalizedEmail = email.toLowerCase().trim();

  // Step 2: Try to find an existing user by googleId.
  let user = await userRepo.findUserByGoogleId(googleId);
  let isNewUser = false;

  if (!user) {
    // Step 3: Try to find by email (account linking).
    user = await userRepo.findUser({ email: normalizedEmail }, '+googleId');

    if (user) {
      // 3a. Link googleId to existing account.
      user.googleId = googleId;
      await userRepo.saveUser(user);
      logger.info(`Google account linked for user: ${user.email} (${user._id})`);
    } else {
      // 3b. No matching account — cannot provision without an organization context.
      // The SRS requires organization registration to happen separately (FR-AUTH-002).
      throw new AppError(
        'No account found for this Google email. Please register your organization first.',
        HTTP_STATUS.NOT_FOUND
      );
    }
  }

  // Check account status.
  if (!user.isActive) {
    throw new AppError(
      'Your account has been deactivated. Please contact your administrator.',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const { accessToken, refreshToken } = await issueTokenPair(user);

  logger.info(`Google OAuth login: ${user.email} (${user._id}), newUser=${isNewUser}`);

  return { user: user.toJSON(), accessToken, refreshToken, isNewUser };
}

/**
 * Rotates the refresh token: validates the current refresh token,
 * issues a new token pair, and invalidates the old refresh token.
 * (ARCHITECTURE_DECISIONS.md §4)
 *
 * @param {string} currentRefreshToken - The refresh token from the HttpOnly cookie.
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 * @throws {AppError} 401 if the token is invalid, expired, or already rotated.
 */
async function refreshAccessToken(currentRefreshToken) {
  if (!currentRefreshToken) {
    throw new AppError('Refresh token is missing.', HTTP_STATUS.UNAUTHORIZED);
  }

  // Decode and verify the JWT structure.
  const decoded = verifyRefreshToken(currentRefreshToken);

  // Load the user with their stored hashed refresh token.
  const user = await userRepo.findUserById(decoded.sub, '+refreshToken');
  if (!user || !user.refreshToken) {
    throw new AppError(
      'Session is invalid. Please log in again.',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Validate the incoming token against the stored hash.
  const tokenMatches = await compareRefreshToken(currentRefreshToken, user.refreshToken);
  if (!tokenMatches) {
    // Possible token theft — clear the stored token as a security measure.
    await userRepo.updateUserById(user._id, { refreshToken: null });
    logger.warn(`Refresh token mismatch detected for user ${user._id}. Session invalidated.`);
    throw new AppError(
      'Session is invalid. Please log in again.',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (!user.isActive) {
    throw new AppError(
      'Your account has been deactivated.',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Issue a fresh token pair (rotation).
  const { accessToken, refreshToken } = await issueTokenPair(user);

  return { user: user.toJSON(), accessToken, refreshToken };
}

/**
 * Logs out the current user by clearing their stored refresh token.
 * (FR-AUTH-007)
 *
 * @param {string} userId - The authenticated user's ID.
 * @returns {Promise<void>}
 */
async function logout(userId) {
  await userRepo.updateUserById(userId, { refreshToken: null });
  logger.info(`User logout: ${userId}`);
}

/**
 * Returns the full profile of the currently authenticated User,
 * including their Organization context.
 * (SRS §5.3.6)
 *
 * @param {string} userId
 * @returns {Promise<{ user: object, organization: object }>}
 * @throws {AppError} 404 if the user or org no longer exists.
 */
async function getCurrentUser(userId) {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
  }

  const organization = await orgRepo.findOrganizationById(user.organizationId);
  if (!organization) {
    throw new AppError('Organization not found.', HTTP_STATUS.NOT_FOUND);
  }

  return { user: user.toJSON(), organization: organization.toJSON() };
}

module.exports = {
  // Token helpers (used by middleware)
  verifyAccessToken,
  getRefreshCookieOptions,

  // Public auth operations
  register,
  login,
  loginWithGoogle,
  refreshAccessToken,
  logout,
  getCurrentUser,
};
