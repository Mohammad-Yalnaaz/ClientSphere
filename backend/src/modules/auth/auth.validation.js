'use strict';

/**
 * auth.validation.js
 *
 * express-validator rule chains for all authentication endpoints.
 *
 * Design decisions:
 * - Each exported array is a self-contained validation chain that is
 *   spread directly into the route definition before the controller.
 * - Validation chains use .trim() and .escape() to reduce injection surface.
 * - Password requirements: minimum 8 chars with at least one uppercase,
 *   one lowercase, one digit, and one special character — a practical
 *   security baseline without being excessively restrictive.
 * - The validateRequest middleware (Module 1) collects errors from these
 *   chains and returns a standardised 422 response if any fail.
 */

const { body } = require('express-validator');

// ── Shared reusable validators ─────────────────────────────────────────────────

const emailValidator = body('email')
  .trim()
  .notEmpty()
  .withMessage('Email is required.')
  .isEmail()
  .withMessage('A valid email address is required.')
  .normalizeEmail();

const passwordValidator = body('password')
  .notEmpty()
  .withMessage('Password is required.')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long.')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/)
  .withMessage(
    'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
  );

const firstNameValidator = body('firstName')
  .trim()
  .notEmpty()
  .withMessage('First name is required.')
  .isLength({ max: 50 })
  .withMessage('First name must not exceed 50 characters.')
  .escape();

const lastNameValidator = body('lastName')
  .trim()
  .notEmpty()
  .withMessage('Last name is required.')
  .isLength({ max: 50 })
  .withMessage('Last name must not exceed 50 characters.')
  .escape();

// ── Register (POST /auth/register) ────────────────────────────────────────────

/**
 * Validates new organization + administrator registration.
 * Expects: organizationName, firstName, lastName, email, password.
 */
const validateRegister = [
  body('organizationName')
    .trim()
    .notEmpty()
    .withMessage('Organization name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters.')
    .escape(),

  firstNameValidator,
  lastNameValidator,
  emailValidator,
  passwordValidator,
];

// ── Login (POST /auth/login) ───────────────────────────────────────────────────

/**
 * Validates credential-based login.
 * Expects: email, password.
 */
const validateLogin = [
  emailValidator,

  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

// ── Google OAuth (POST /auth/google) ──────────────────────────────────────────

/**
 * Validates Google OAuth ID token submission.
 * Expects: idToken (from Google Sign-In on the frontend).
 */
const validateGoogleAuth = [
  body('idToken')
    .trim()
    .notEmpty()
    .withMessage('Google ID token is required.'),
];

// ── Refresh Token (POST /auth/refresh) ────────────────────────────────────────
// The refresh token is read from the HttpOnly cookie, not the request body,
// so no body validation is needed for this endpoint.
// An empty array is exported for consistency with the route pattern.
const validateRefresh = [];

module.exports = {
  validateRegister,
  validateLogin,
  validateGoogleAuth,
  validateRefresh,
};
