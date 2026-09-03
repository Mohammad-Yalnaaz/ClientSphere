'use strict';

/**
 * task.types.js
 *
 * JSDoc type definitions for Task and Subtask entities.
 *
 * @typedef {'TODO'|'IN_PROGRESS'|'IN_REVIEW'|'COMPLETED'|'CANCELLED'|'ARCHIVED'} TaskStatus
 * @typedef {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'} TaskPriority
 *
 * @typedef {Object} Task
 * @property {import('mongoose').Types.ObjectId} _id
 * @property {import('mongoose').Types.ObjectId} organizationId
 * @property {import('mongoose').Types.ObjectId} projectId
 * @property {string} title
 * @property {string} [description]
 * @property {TaskStatus} status
 * @property {TaskPriority} priority
 * @property {Date} [dueDate]
 * @property {import('mongoose').Types.ObjectId} [assignedTo]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 *
 * @typedef {Object} Subtask
 * @property {import('mongoose').Types.ObjectId} _id
 * @property {import('mongoose').Types.ObjectId} taskId
 * @property {string} title
 * @property {boolean} isCompleted
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

module.exports = {};
