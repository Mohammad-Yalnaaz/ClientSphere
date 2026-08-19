'use strict';

/**
 * organizations.repository.js
 *
 * All MongoDB operations for the Organization entity live here.
 * Services call these methods; no other layer touches Mongoose directly
 * (ARCHITECTURE_DECISIONS.md §9).
 *
 * Every method receives plain values and returns plain Mongoose documents
 * (or null / arrays). No HTTP-layer concerns belong here.
 */

const Organization = require('./organizations.model');

/**
 * Creates a new Organization document.
 *
 * @param {object} data - Fields to populate on the new document.
 * @returns {Promise<import('mongoose').Document>} The saved Organization.
 */
async function createOrganization(data) {
  const org = new Organization(data);
  return org.save();
}

/**
 * Finds an Organization by its MongoDB _id.
 *
 * @param {string|import('mongoose').Types.ObjectId} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findOrganizationById(id) {
  return Organization.findById(id);
}

/**
 * Finds a single Organization matching the given filter.
 *
 * @param {object} filter - Mongoose query filter.
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findOrganization(filter) {
  return Organization.findOne(filter);
}

/**
 * Updates an Organization document by _id and returns the updated doc.
 *
 * @param {string|import('mongoose').Types.ObjectId} id
 * @param {object} updates - Fields to update.
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function updateOrganizationById(id, updates) {
  return Organization.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
}

module.exports = {
  createOrganization,
  findOrganizationById,
  findOrganization,
  updateOrganizationById,
};
