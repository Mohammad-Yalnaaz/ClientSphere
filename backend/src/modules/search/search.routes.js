'use strict';

/**
 * search.routes.js
 *
 * Route definitions for Global Search.
 *
 * GET /api/v1/search - Global search across Clients, Projects, Tasks
 */

const { Router } = require('express');

const authenticate = require('../../middleware/authenticate.middleware');
const organizationScope = require('../../middleware/organizationScope.middleware');
const validateRequest = require('../../middleware/validateRequest.middleware');

const searchController = require('./search.controller');
const { validateSearchQuery } = require('./search.validation');

const router = Router();

// Search requires authentication and organization scoping
router.use(authenticate, organizationScope);

router.get(
  '/',
  validateSearchQuery,
  validateRequest,
  searchController.search
);

module.exports = router;
