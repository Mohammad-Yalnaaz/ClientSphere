'use strict';

/**
 * clients.routes.js
 *
 * Route definitions for the Clients module.
 *
 * Route layout:
 *   GET    /              – List clients (Admin, Manager)
 *   POST   /              – Create client (Admin, Manager)
 *   GET    /:id           – Get single client (Admin, Manager)
 *   PATCH  /:id           – Update client (Admin, Manager)
 *   PATCH  /:id/archive   – Archive client (Admin, Manager)
 *   PATCH  /:id/restore   – Restore archived client (Admin, Manager)
 *
 * All routes require authentication + org scope.
 */

const { Router } = require('express');

const authenticate      = require('../../middleware/authenticate.middleware');
const authorizeRole     = require('../../middleware/authorizeRole.middleware');
const organizationScope = require('../../middleware/organizationScope.middleware');
const validateRequest   = require('../../middleware/validateRequest.middleware');
const { ROLES }         = require('../../constants/roles.constants');

const clientController = require('./clients.controller');
const {
  validateCreateClient,
  validateUpdateClient,
  validateListClients,
} = require('./clients.validation');

const router = Router();

// All client routes require authentication and org scope.
router.use(authenticate, organizationScope);

// Only Administrators and Managers can manage clients.
router.use(authorizeRole(ROLES.ADMINISTRATOR, ROLES.MANAGER));

// ── GET / — List clients ──────────────────────────────────────────────────────
router.get('/', validateListClients, validateRequest, clientController.listClients);

// ── POST / — Create client ────────────────────────────────────────────────────
router.post('/', validateCreateClient, validateRequest, clientController.createClient);

// ── GET /:id — Get single client ──────────────────────────────────────────────
router.get('/:id', clientController.getClientById);

// ── PATCH /:id — Update client ────────────────────────────────────────────────
router.patch('/:id', validateUpdateClient, validateRequest, clientController.updateClient);

// ── PATCH /:id/archive — Archive client ──────────────────────────────────────
router.patch('/:id/archive', clientController.archiveClient);

// ── PATCH /:id/restore — Restore client ──────────────────────────────────────
router.patch('/:id/restore', clientController.restoreClient);

module.exports = router;
