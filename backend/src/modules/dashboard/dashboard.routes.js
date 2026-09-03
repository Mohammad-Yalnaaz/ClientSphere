'use strict';

/**
 * dashboard.routes.js
 *
 * Route definitions for Dashboard & Analytics.
 *
 * GET /api/v1/dashboard - Retrieve role-customized dashboard
 */

const { Router } = require('express');

const authenticate = require('../../middleware/authenticate.middleware');
const organizationScope = require('../../middleware/organizationScope.middleware');
const validateRequest = require('../../middleware/validateRequest.middleware');

const dashboardController = require('./dashboard.controller');
const { validateDashboardQuery } = require('./dashboard.validation');

const router = Router();

// All dashboard endpoints require authentication and org context
router.use(authenticate, organizationScope);

router.get(
  '/',
  validateDashboardQuery,
  validateRequest,
  dashboardController.getDashboard
);

module.exports = router;
