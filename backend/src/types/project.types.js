'use strict';

/**
 * project.types.js
 *
 * JSDoc type definitions for Project entities.
 *
 * @typedef {'PLANNING'|'ACTIVE'|'ON_HOLD'|'COMPLETED'|'CANCELLED'|'ARCHIVED'} ProjectStatus
 * @typedef {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'} ProjectPriority
 *
 * @typedef {Object} Project
 * @property {import('mongoose').Types.ObjectId} _id
 * @property {import('mongoose').Types.ObjectId} organizationId
 * @property {import('mongoose').Types.ObjectId} clientId
 * @property {string} name
 * @property {string} [description]
 * @property {ProjectStatus} status
 * @property {ProjectPriority} priority
 * @property {Date} [startDate]
 * @property {Date} [dueDate]
 * @property {import('mongoose').Types.ObjectId[]} managers
 * @property {import('mongoose').Types.ObjectId[]} members
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

module.exports = {};
