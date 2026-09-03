'use strict';

/**
 * organization.types.js
 *
 * JSDoc type definitions for Organization entities.
 *
 * @typedef {Object} OrganizationSettings
 * @property {string} [timezone]
 * @property {string} [dateFormat]
 * @property {boolean} [allowClientRegistration]
 *
 * @typedef {Object} Organization
 * @property {import('mongoose').Types.ObjectId} _id
 * @property {string} name
 * @property {string} slug
 * @property {OrganizationSettings} settings
 * @property {boolean} isActive
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

module.exports = {};
