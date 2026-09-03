'use strict';

/**
 * user.types.js
 *
 * JSDoc type definitions for User entities.
 *
 * @typedef {'ADMINISTRATOR'|'MANAGER'|'EMPLOYEE'|'CLIENT'} UserRole
 *
 * @typedef {Object} User
 * @property {import('mongoose').Types.ObjectId} _id
 * @property {import('mongoose').Types.ObjectId} organizationId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} [passwordHash]
 * @property {UserRole} role
 * @property {boolean} isActive
 * @property {string} [avatarUrl]
 * @property {import('mongoose').Types.ObjectId} [clientId]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

module.exports = {};
