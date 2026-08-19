'use strict';

/**
 * users.validation.js
 *
 * express-validator rule chains for all User management endpoints.
 */

const { body, query, param } = require('express-validator');
const { ROLES } = require('../../constants/roles.constants');

// ── Shared ────────────────────────────────────────────────────────────────────

const validRoles = Object.values(ROLES);

// ── Create User (POST /users) ─────────────────────────────────────────────────

const validateCreateUser = [
  body('firstName')
    .trim().notEmpty().withMessage('First name is required.')
    .isLength({ max: 50 }).withMessage('First name must not exceed 50 characters.'),

  body('lastName')
    .trim().notEmpty().withMessage('Last name is required.')
    .isLength({ max: 50 }).withMessage('Last name must not exceed 50 characters.'),

  body('email')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('A valid email address is required.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/)
    .withMessage('Password must contain uppercase, lowercase, digit, and special character.'),

  body('role')
    .optional()
    .isIn(validRoles)
    .withMessage(`Role must be one of: ${validRoles.join(', ')}.`),
];

// ── Update Profile (PATCH /users/:id/profile) ─────────────────────────────────

const validateUpdateProfile = [
  body('firstName')
    .optional().trim()
    .isLength({ max: 50 }).withMessage('First name must not exceed 50 characters.'),

  body('lastName')
    .optional().trim()
    .isLength({ max: 50 }).withMessage('Last name must not exceed 50 characters.'),

  body('avatarUrl')
    .optional().trim()
    .isURL({ require_protocol: true })
    .withMessage('Avatar URL must be a valid URL.'),

  body().custom((_, { req }) => {
    const { firstName, lastName, avatarUrl } = req.body;
    if (firstName === undefined && lastName === undefined && avatarUrl === undefined) {
      throw new Error('At least one field (firstName, lastName, or avatarUrl) is required.');
    }
    return true;
  }),
];

// ── Change Role (PATCH /users/:id/role) ───────────────────────────────────────

const validateChangeRole = [
  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(validRoles)
    .withMessage(`Role must be one of: ${validRoles.join(', ')}.`),
];

// ── List Users Query (GET /users) ─────────────────────────────────────────────

const validateListUsers = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer.'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),

  query('role')
    .optional()
    .isIn(validRoles).withMessage(`Role filter must be one of: ${validRoles.join(', ')}.`),

  query('isActive')
    .optional()
    .isIn(['true', 'false']).withMessage('isActive must be true or false.'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search term must not exceed 100 characters.'),
];

module.exports = {
  validateCreateUser,
  validateUpdateProfile,
  validateChangeRole,
  validateListUsers,
};
