'use strict';

/**
 * tasks.validation.js
 *
 * express-validator rule chains for all Task and Subtask endpoints.
 *
 * Part A — Task create + update chains
 * Part B — Status change + assignment chains
 * Part C — Subtask chains + list query chains
 */

const { body, query } = require('express-validator');
const { TASK_STATUSES, TASK_PRIORITIES } = require('./tasks.constants');

const validStatuses   = Object.values(TASK_STATUSES);
const validPriorities = Object.values(TASK_PRIORITIES);

// ═══════════════════════════════════════════════════════════════════════════════
// PART A — TASK CREATE + UPDATE
// ═══════════════════════════════════════════════════════════════════════════════

const validateCreateTask = [
  body('title')
    .trim().notEmpty().withMessage('Task title is required.')
    .isLength({ max: 300 }).withMessage('Title must not exceed 300 characters.'),

  body('description')
    .optional().trim()
    .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters.'),

  body('priority')
    .optional()
    .isIn(validPriorities)
    .withMessage(`Priority must be one of: ${validPriorities.join(', ')}.`),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date.')
    .toDate(),

  body('assignedTo')
    .optional()
    .isMongoId().withMessage('Assigned user ID must be a valid ID.'),
];

const validateUpdateTask = [
  body('title')
    .optional().trim()
    .isLength({ min: 1, max: 300 }).withMessage('Title must be between 1 and 300 characters.'),

  body('description')
    .optional().trim()
    .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters.'),

  body('priority')
    .optional()
    .isIn(validPriorities)
    .withMessage(`Priority must be one of: ${validPriorities.join(', ')}.`),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date.')
    .toDate(),

  body().custom((_, { req }) => {
    const allowed = ['title', 'description', 'priority', 'dueDate'];
    if (!allowed.some(f => req.body[f] !== undefined)) {
      throw new Error('At least one field must be provided for update.');
    }
    return true;
  }),
];

// ═══════════════════════════════════════════════════════════════════════════════
// PART B — STATUS + ASSIGNMENT
// ═══════════════════════════════════════════════════════════════════════════════

const validateChangeTaskStatus = [
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(', ')}.`),
];

const validateAssignTask = [
  body('userId')
    .notEmpty().withMessage('User ID is required.')
    .isMongoId().withMessage('User ID must be a valid ID.'),
];

// ═══════════════════════════════════════════════════════════════════════════════
// PART C — SUBTASKS + LIST QUERY
// ═══════════════════════════════════════════════════════════════════════════════

const validateCreateSubtask = [
  body('title')
    .trim().notEmpty().withMessage('Subtask title is required.')
    .isLength({ max: 300 }).withMessage('Subtask title must not exceed 300 characters.'),
];

const validateUpdateSubtask = [
  body('title')
    .trim().notEmpty().withMessage('Subtask title is required.')
    .isLength({ max: 300 }).withMessage('Subtask title must not exceed 300 characters.'),
];

const validateListTasks = [
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

  query('assignedTo')
    .optional().isMongoId().withMessage('assignedTo must be a valid user ID.'),

  query('search')
    .optional().trim()
    .isLength({ max: 100 }).withMessage('Search term must not exceed 100 characters.'),
];

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateChangeTaskStatus,
  validateAssignTask,
  validateCreateSubtask,
  validateUpdateSubtask,
  validateListTasks,
};
