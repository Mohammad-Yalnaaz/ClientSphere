'use strict';

/**
 * activityLogs.routes.js
 *
 * Route definitions for Activity Logs audit trail.
 *
 * GET /api/v1/activity-logs - Retrieve organization/entity activity logs
 */

const { Router } = require('express');

const authenticate = require('../../middleware/authenticate.middleware');
const organizationScope = require('../../middleware/organizationScope.middleware');
const validateRequest = require('../../middleware/validateRequest.middleware');

const activityLogController = require('./activityLogs.controller');
const { validateListActivityLogs } = require('./activityLogs.validation');

const router = Router();

// All activity logs endpoints require authentication and org context
router.use(authenticate, organizationScope);

router.get(
  '/',
  validateListActivityLogs,
  validateRequest,
  activityLogController.listActivityLogs
);

module.exports = router;
