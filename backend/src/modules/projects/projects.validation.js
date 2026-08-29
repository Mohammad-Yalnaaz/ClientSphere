'use strict';

/**
 * projects.validation.js
 *
 * express-validator rule chains for all Project endpoints.
 *
 * Split:
 *  Part A — create + update chains (body validation)
 *  Part B — status, team, and list query chains
 */

const { body, query, param } = require('express-validator');
const { PROJECT_STATUSES, PROJECT_PRIORITIES } = require('./projects.constants');

const validStatuses   = Object.values(PROJECT_STATUSES);
const validPriorities = Object.values(PROJECT_PRIORITIES);

// ═══════════════════════════════════════════════════════════════════════════════
// PART A — CREATE AND UPDATE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /projects — Create a new project.
 */
const validateCreateProject = [
  body('name')
    .trim().notEmpty().withMessage('Project name is required.')
    .isLength({ max: 200 }).withMessage('Project name must not exceed 200 characters.'),

  body('clientId')
    .notEmpty().withMessage('Client ID is required.')
    .isMongoId().withMessage('Client ID must be a valid ID.'),

  body('description')
    .optional().trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters.'),

  body('priority')
    .optional()
    .isIn(validPriorities)
    .withMessage(`Priority must be one of: ${validPriorities.join(', ')}.`),

  body('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date.')
    .toDate(),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date.')
    .toDate()
    .custom((dueDate, { req }) => {
      if (req.body.startDate && dueDate < new Date(req.body.startDate)) {
        throw new Error('Due date must be on or after the start date.');
      }
      return true;
    }),

  body('managers')
    .optional()
    .isArray().withMessage('Managers must be an array.')
    .custom(arr => arr.every(id => /^[a-f\d]{24}$/i.test(id)))
    .withMessage('Each manager ID must be a valid ID.'),

  body('members')
    .optional()
    .isArray().withMessage('Members must be an array.')
    .custom(arr => arr.every(id => /^[a-f\d]{24}$/i.test(id)))
    .withMessage('Each member ID must be a valid ID.'),
];

/**
 * PATCH /projects/:id — Update project details.
 */
const validateUpdateProject = [
  body('name')
    .optional().trim()
    .isLength({ min: 1, max: 200 }).withMessage('Project name must be between 1 and 200 characters.'),

  body('description')
    .optional().trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters.'),

  body('priority')
    .optional()
    .isIn(validPriorities)
    .withMessage(`Priority must be one of: ${validPriorities.join(', ')}.`),

  body('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date.')
    .toDate(),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date.')
    .toDate(),

  body().custom((_, { req }) => {
    const allowed = ['name', 'description', 'priority', 'startDate', 'dueDate'];
    const hasField = allowed.some(f => req.body[f] !== undefined);
    if (!hasField) throw new Error('At least one field must be provided for update.');
    return true;
  }),
];

// ═══════════════════════════════════════════════════════════════════════════════
// PART B — STATUS, TEAM, AND QUERY CHAINS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * PATCH /projects/:id/status — Change project status.
 */
const validateChangeStatus = [
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(', ')}.`),
];

/**
 * POST /projects/:id/managers or members — Add team member.
 */
const validateAddTeamMember = [
  body('userId')
    .notEmpty().withMessage('User ID is required.')
    .isMongoId().withMessage('User ID must be a valid ID.'),
];

/**
 * GET /projects — List projects with search + filter + pagination.
 */
const validateListProjects = [
  query('page')
    .optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),

  query('limit')
    .optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),

  query('status')
    .optional().isIn(validStatuses)
    .withMessage(`Status filter must be one of: ${validStatuses.join(', ')}.`),

  query('priority')
    .optional().isIn(validPriorities)
    .withMessage(`Priority filter must be one of: ${validPriorities.join(', ')}.`),

  query('clientId')
    .optional().isMongoId().withMessage('Client ID must be a valid ID.'),

  query('search')
    .optional().trim()
    .isLength({ max: 100 }).withMessage('Search term must not exceed 100 characters.'),
];

module.exports = {
  validateCreateProject,
  validateUpdateProject,
  validateChangeStatus,
  validateAddTeamMember,
  validateListProjects,
};
