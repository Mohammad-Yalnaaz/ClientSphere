'use strict';

/**
 * clients.controller.js
 *
 * Thin HTTP adapter for Client management endpoints.
 *
 * Architecture rule (ARCHITECTURE_DECISIONS.md §9):
 *  - No business logic — only extraction, delegation, and response.
 */

const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendNoContent } = require('../../utils/apiResponse.util');
const clientService = require('./clients.service');

// ── List Clients ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/clients
 * Returns paginated list of clients in the organization.
 */
const listClients = asyncHandler(async (req, res) => {
  const { search, status, page, limit } = req.query;

  const result = await clientService.listClients(req.organizationId, {
    search, status, page, limit,
  });

  return sendSuccess(
    res,
    'Clients retrieved successfully.',
    { clients: result.clients },
    200,
    { total: result.total, page: result.page, limit: result.limit }
  );
});

// ── Get Single Client ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/clients/:id
 */
const getClientById = asyncHandler(async (req, res) => {
  const client = await clientService.getClientById(req.params.id, req.organizationId);
  return sendSuccess(res, 'Client retrieved successfully.', { client });
});

// ── Create Client ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/clients
 */
const createClient = asyncHandler(async (req, res) => {
  const { name, contactName, contactEmail, contactPhone, description, logoUrl, website } = req.body;

  const client = await clientService.createClient(
    req.organizationId,
    req.user._id.toString(),
    { name, contactName, contactEmail, contactPhone, description, logoUrl, website }
  );

  return sendCreated(res, 'Client created successfully.', { client });
});

// ── Update Client ─────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/clients/:id
 */
const updateClient = asyncHandler(async (req, res) => {
  const client = await clientService.updateClient(
    req.params.id,
    req.organizationId,
    req.body
  );

  return sendSuccess(res, 'Client updated successfully.', { client });
});

// ── Archive Client ────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/clients/:id/archive
 */
const archiveClient = asyncHandler(async (req, res) => {
  const client = await clientService.archiveClient(req.params.id, req.organizationId);
  return sendSuccess(res, 'Client archived successfully.', { client });
});

// ── Restore Client ────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/clients/:id/restore
 */
const restoreClient = asyncHandler(async (req, res) => {
  const client = await clientService.restoreClient(req.params.id, req.organizationId);
  return sendSuccess(res, 'Client restored successfully.', { client });
});

module.exports = {
  listClients,
  getClientById,
  createClient,
  updateClient,
  archiveClient,
  restoreClient,
};
