'use strict';

/**
 * clients.repository.js
 *
 * All database access operations for the Client entity.
 * No business logic here — only Mongoose queries.
 *
 * Architecture (ARCHITECTURE_DECISIONS.md §9):
 *  - All DB access for Client goes through this file.
 *  - Services call these methods; they never import Mongoose models directly.
 */

const Client = require('./clients.model');

// ── Create ────────────────────────────────────────────────────────────────────

/**
 * Creates a new Client document.
 *
 * @param {object} data
 * @returns {Promise<import('mongoose').Document>}
 */
async function createClient(data) {
  return Client.create(data);
}

// ── Read ──────────────────────────────────────────────────────────────────────

/**
 * Finds a single Client by a filter object.
 * Used for single-record lookups (by _id + organizationId for scoping).
 *
 * @param {object} filter
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findClient(filter) {
  return Client.findOne(filter);
}

/**
 * Finds a Client by ID, scoped to an organization.
 *
 * @param {string} clientId
 * @param {string} organizationId
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findClientById(clientId, organizationId) {
  return Client.findOne({ _id: clientId, organizationId });
}

/**
 * Finds all clients matching a filter with optional pagination and sorting.
 *
 * @param {object} filter
 * @param {object} [options]
 * @param {number} [options.skip=0]
 * @param {number} [options.limit=20]
 * @param {object} [options.sort={ createdAt: -1 }]
 * @returns {Promise<import('mongoose').Document[]>}
 */
async function findClients(filter, options = {}) {
  const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
  return Client.find(filter).skip(skip).limit(limit).sort(sort);
}

/**
 * Counts clients matching a filter.
 *
 * @param {object} filter
 * @returns {Promise<number>}
 */
async function countClients(filter) {
  return Client.countDocuments(filter);
}

// ── Update ────────────────────────────────────────────────────────────────────

/**
 * Updates a Client by ID and returns the updated document.
 *
 * @param {string} clientId
 * @param {object} updates
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function updateClientById(clientId, updates) {
  return Client.findByIdAndUpdate(
    clientId,
    { $set: updates },
    { new: true, runValidators: true }
  );
}

module.exports = {
  createClient,
  findClient,
  findClientById,
  findClients,
  countClients,
  updateClientById,
};
