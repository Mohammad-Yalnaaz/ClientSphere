'use strict';

/**
 * clients.validation.js
 *
 * express-validator rule chains for all Client management endpoints.
 */

const { body, query } = require('express-validator');
const { CLIENT_STATUSES } = require('./clients.model');

const validStatuses = Object.values(CLIENT_STATUSES);

// ── Create Client (POST /clients) ─────────────────────────────────────────────

const validateCreateClient = [
  body('name')
    .trim().notEmpty().withMessage('Client name is required.')
    .isLength({ max: 150 }).withMessage('Client name must not exceed 150 characters.'),

  body('contactName')
    .optional().trim()
    .isLength({ max: 100 }).withMessage('Contact name must not exceed 100 characters.'),

  body('contactEmail')
    .optional().trim()
    .isEmail().withMessage('Contact email must be a valid email address.')
    .normalizeEmail(),

  body('contactPhone')
    .optional().trim()
    .isLength({ max: 30 }).withMessage('Contact phone must not exceed 30 characters.'),

  body('description')
    .optional().trim()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters.'),

  body('logoUrl')
    .optional().trim()
    .isURL({ require_protocol: true }).withMessage('Logo URL must be a valid URL.'),

  body('website')
    .optional().trim()
    .isURL({ require_protocol: true }).withMessage('Website must be a valid URL.'),
];

// ── Update Client (PATCH /clients/:id) ───────────────────────────────────────

const validateUpdateClient = [
  body('name')
    .optional().trim()
    .isLength({ min: 1, max: 150 }).withMessage('Client name must be between 1 and 150 characters.'),

  body('contactName')
    .optional().trim()
    .isLength({ max: 100 }).withMessage('Contact name must not exceed 100 characters.'),

  body('contactEmail')
    .optional().trim()
    .isEmail().withMessage('Contact email must be a valid email address.')
    .normalizeEmail(),

  body('contactPhone')
    .optional().trim()
    .isLength({ max: 30 }).withMessage('Contact phone must not exceed 30 characters.'),

  body('description')
    .optional().trim()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters.'),

  body('logoUrl')
    .optional().trim()
    .isURL({ require_protocol: true }).withMessage('Logo URL must be a valid URL.'),

  body('website')
    .optional().trim()
    .isURL({ require_protocol: true }).withMessage('Website must be a valid URL.'),

  // Ensure at least one field was sent.
  body().custom((_, { req }) => {
    const allowed = ['name', 'contactName', 'contactEmail', 'contactPhone', 'description', 'logoUrl', 'website'];
    const hasField = allowed.some(f => req.body[f] !== undefined);
    if (!hasField) throw new Error('At least one field must be provided for update.');
    return true;
  }),
];

// ── List Clients Query (GET /clients) ─────────────────────────────────────────

const validateListClients = [
  query('page')
    .optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),

  query('limit')
    .optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),

  query('status')
    .optional().isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(', ')}.`),

  query('search')
    .optional().trim()
    .isLength({ max: 100 }).withMessage('Search term must not exceed 100 characters.'),
];

module.exports = {
  validateCreateClient,
  validateUpdateClient,
  validateListClients,
};
