'use strict';

/**
 * users.repository.js
 *
 * All MongoDB operations for the User entity live here.
 * Services call these methods; no other layer imports User model directly
 * (ARCHITECTURE_DECISIONS.md §9).
 */

const User = require('./users.model');

/**
 * Creates and saves a new User document.
 *
 * @param {object} data - Fields for the new User.
 * @returns {Promise<import('mongoose').Document>}
 */
async function createUser(data) {
  const user = new User(data);
  return user.save();
}

/**
 * Finds a User by MongoDB _id.
 * By default, sensitive fields (password, refreshToken, etc.) are excluded
 * by the schema's `select: false` — add them explicitly via selectFields if needed.
 *
 * @param {string|import('mongoose').Types.ObjectId} id
 * @param {string} [selectFields] - Space-separated field names to include (e.g. '+password').
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findUserById(id, selectFields = '') {
  return User.findById(id).select(selectFields);
}

/**
 * Finds a single User matching the given filter.
 *
 * @param {object} filter - Mongoose query filter.
 * @param {string} [selectFields] - Space-separated additional fields to include.
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findUser(filter, selectFields = '') {
  return User.findOne(filter).select(selectFields);
}

/**
 * Finds a User by email (case-insensitive via schema lowercase:true).
 * Optionally selects normally-hidden fields (e.g. '+password').
 *
 * @param {string} email
 * @param {string} [selectFields]
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findUserByEmail(email, selectFields = '') {
  return User.findOne({ email: email.toLowerCase().trim() }).select(selectFields);
}

/**
 * Finds a User by email scoped to a specific organization.
 *
 * @param {string} email
 * @param {string|import('mongoose').Types.ObjectId} organizationId
 * @param {string} [selectFields]
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findUserByEmailAndOrg(email, organizationId, selectFields = '') {
  return User.findOne({
    email: email.toLowerCase().trim(),
    organizationId,
  }).select(selectFields);
}

/**
 * Finds a User by their Google OAuth ID.
 *
 * @param {string} googleId
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findUserByGoogleId(googleId) {
  return User.findOne({ googleId }).select('+googleId');
}

/**
 * Updates a User by _id and returns the updated document.
 *
 * @param {string|import('mongoose').Types.ObjectId} id
 * @param {object} updates
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function updateUserById(id, updates) {
  return User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
}

/**
 * Saves changes made directly on a User document instance.
 * Use when the caller needs pre-save hooks to run (e.g. password hashing).
 *
 * @param {import('mongoose').Document} userDoc - A Mongoose User document.
 * @returns {Promise<import('mongoose').Document>}
 */
async function saveUser(userDoc) {
  return userDoc.save();
}

/**
 * Returns the count of Administrator users in an organization.
 * Used to enforce FR-ORG-007 (every organization must have ≥1 admin).
 *
 * @param {string|import('mongoose').Types.ObjectId} organizationId
 * @returns {Promise<number>}
 */
async function countAdminsByOrg(organizationId) {
  const { ROLES } = require('../../constants/roles.constants');
  return User.countDocuments({
    organizationId,
    role: ROLES.ADMINISTRATOR,
    isActive: true,
  });
}

module.exports = {
  createUser,
  findUserById,
  findUser,
  findUserByEmail,
  findUserByEmailAndOrg,
  findUserByGoogleId,
  updateUserById,
  saveUser,
  countAdminsByOrg,
};
