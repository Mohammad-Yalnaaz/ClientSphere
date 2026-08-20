'use strict';

/**
 * clients.service.js
 *
 * Business logic for all Client management operations.
 *
 * Responsibilities:
 *  - List clients with search + filter + pagination (FR-CLIENT-006, FR-CLIENT-007).
 *  - Get a single client record (FR-CLIENT-003).
 *  - Create a new client record (FR-CLIENT-001).
 *  - Update client information (FR-CLIENT-002).
 *  - Archive a client (FR-CLIENT-004).
 *  - Restore an archived client (FR-CLIENT-005).
 *
 * Architecture (ARCHITECTURE_DECISIONS.md §9):
 *  - Calls repositories only — never Mongoose models directly.
 *  - Throws AppError for all operational failures.
 *  - No req / res / next.
 *
 * Org isolation (FR-CLIENT-011, FR-ORG-008):
 *  - Every operation filters by organizationId.
 *
 * Note on FR-CLIENT-013 (Audit Logging):
 *  - Activity logging wired in Module 12.
 */

const AppError = require('../../utils/appError.util');
const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');
const logger = require('../../utils/logger.util');

const clientRepo = require('./clients.repository');
const { CLIENT_STATUSES } = require('./clients.model');

// ── Public service methods ─────────────────────────────────────────────────────

/**
 * Lists clients within an organization.
 * Supports search (by name/contactEmail) and filter (by status).
 * (FR-CLIENT-003, FR-CLIENT-006, FR-CLIENT-007)
 *
 * @param {string} organizationId
 * @param {object} query
 * @param {string}  [query.search]   - Matched against name and contactEmail.
 * @param {string}  [query.status]   - Filter by status (ACTIVE|ARCHIVED).
 * @param {number}  [query.page=1]
 * @param {number}  [query.limit=20]
 * @returns {Promise<{ clients: object[], total: number, page: number, limit: number }>}
 */
async function listClients(organizationId, query = {}) {
  const { search, status, page = 1, limit = 20 } = query;

  const filter = { organizationId };

  // Status filter — default to ACTIVE only if not explicitly specified.
  if (status && Object.values(CLIENT_STATUSES).includes(status)) {
    filter.status = status;
  }

  // Search against name and contact email.
  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [{ name: regex }, { contactEmail: regex }, { contactName: regex }];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [clients, total] = await Promise.all([
    clientRepo.findClients(filter, { skip, limit: Number(limit) }),
    clientRepo.countClients(filter),
  ]);

  return {
    clients: clients.map(c => c.toJSON()),
    total,
    page: Number(page),
    limit: Number(limit),
  };
}

/**
 * Gets a single client by ID, scoped to the organization.
 * (FR-CLIENT-003)
 *
 * @param {string} clientId
 * @param {string} organizationId
 * @returns {Promise<object>} Client as plain JSON.
 * @throws {AppError} 404 if not found.
 */
async function getClientById(clientId, organizationId) {
  const client = await clientRepo.findClientById(clientId, organizationId);
  if (!client) {
    throw new AppError('Client not found.', HTTP_STATUS.NOT_FOUND);
  }
  return client.toJSON();
}

/**
 * Creates a new Client record within an organization.
 * Performs advisory duplicate check on name + contactEmail (FR-CLIENT-010).
 * (FR-CLIENT-001)
 *
 * @param {string} organizationId
 * @param {string} createdBy - ID of the creating user.
 * @param {object} data
 * @returns {Promise<object>} Created client as plain JSON.
 * @throws {AppError} 409 on exact name duplicate within org.
 */
async function createClient(organizationId, createdBy, data) {
  // Advisory duplicate check on name (FR-CLIENT-010).
  const duplicate = await clientRepo.findClient({
    organizationId,
    name: { $regex: new RegExp(`^${data.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  });

  if (duplicate) {
    throw new AppError(
      `A client named "${data.name.trim()}" already exists in this organization.`,
      HTTP_STATUS.CONFLICT
    );
  }

  const client = await clientRepo.createClient({
    organizationId,
    createdBy,
    name: data.name.trim(),
    contactName: data.contactName || null,
    contactEmail: data.contactEmail ? data.contactEmail.toLowerCase().trim() : null,
    contactPhone: data.contactPhone || null,
    description: data.description || null,
    logoUrl: data.logoUrl || null,
    website: data.website || null,
    status: CLIENT_STATUSES.ACTIVE,
  });

  logger.info(`Client created: ${client.name} (${client._id}) in org ${organizationId}`);

  return client.toJSON();
}

/**
 * Updates an existing Client record.
 * (FR-CLIENT-002)
 *
 * @param {string} clientId
 * @param {string} organizationId
 * @param {object} updates
 * @returns {Promise<object>} Updated client as plain JSON.
 * @throws {AppError} 404 if not found.
 */
async function updateClient(clientId, organizationId, updates) {
  // Verify the client exists in this org first.
  const existing = await clientRepo.findClientById(clientId, organizationId);
  if (!existing) {
    throw new AppError('Client not found.', HTTP_STATUS.NOT_FOUND);
  }

  // Build allowed update fields only.
  const allowedFields = {};
  const allowed = ['name', 'contactName', 'contactEmail', 'contactPhone', 'description', 'logoUrl', 'website'];

  allowed.forEach(field => {
    if (updates[field] !== undefined) {
      allowedFields[field] = typeof updates[field] === 'string'
        ? updates[field].trim()
        : updates[field];
    }
  });

  const client = await clientRepo.updateClientById(clientId, allowedFields);

  logger.info(`Client updated: ${clientId} in org ${organizationId}`);

  return client.toJSON();
}

/**
 * Archives a client — marks it as ARCHIVED, preserving all data.
 * (FR-CLIENT-004, FR-CLIENT-008)
 *
 * @param {string} clientId
 * @param {string} organizationId
 * @returns {Promise<object>} Updated client as plain JSON.
 * @throws {AppError} 404 or 409.
 */
async function archiveClient(clientId, organizationId) {
  const client = await clientRepo.findClientById(clientId, organizationId);
  if (!client) {
    throw new AppError('Client not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (client.status === CLIENT_STATUSES.ARCHIVED) {
    throw new AppError('Client is already archived.', HTTP_STATUS.CONFLICT);
  }

  const updated = await clientRepo.updateClientById(clientId, {
    status: CLIENT_STATUSES.ARCHIVED,
  });

  logger.info(`Client archived: ${clientId} in org ${organizationId}`);

  return updated.toJSON();
}

/**
 * Restores an archived client back to ACTIVE status.
 * (FR-CLIENT-005)
 *
 * @param {string} clientId
 * @param {string} organizationId
 * @returns {Promise<object>} Updated client as plain JSON.
 * @throws {AppError} 404 or 409.
 */
async function restoreClient(clientId, organizationId) {
  const client = await clientRepo.findClientById(clientId, organizationId);
  if (!client) {
    throw new AppError('Client not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (client.status === CLIENT_STATUSES.ACTIVE) {
    throw new AppError('Client is already active.', HTTP_STATUS.CONFLICT);
  }

  const updated = await clientRepo.updateClientById(clientId, {
    status: CLIENT_STATUSES.ACTIVE,
  });

  logger.info(`Client restored: ${clientId} in org ${organizationId}`);

  return updated.toJSON();
}

module.exports = {
  listClients,
  getClientById,
  createClient,
  updateClient,
  archiveClient,
  restoreClient,
};
