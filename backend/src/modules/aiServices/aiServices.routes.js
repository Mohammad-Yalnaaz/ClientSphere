'use strict';

/**
 * aiServices.routes.js
 *
 * Route definitions for AI-assisted productivity capabilities.
 */

const { Router } = require('express');

const authenticate = require('../../middleware/authenticate.middleware');
const organizationScope = require('../../middleware/organizationScope.middleware');
const validateRequest = require('../../middleware/validateRequest.middleware');

const aiServicesController = require('./aiServices.controller');
const {
  validateTaskDescription,
  validateProjectSummary,
  validateCommentSummary,
} = require('./aiServices.validation');

const router = Router();

// All AI endpoints require authentication and organizational scoping
router.use(authenticate, organizationScope);

router.post(
  '/projects/:projectId/generate-task-description',
  validateTaskDescription,
  validateRequest,
  aiServicesController.generateTaskDescription
);

router.post(
  '/projects/:projectId/summary',
  validateProjectSummary,
  validateRequest,
  aiServicesController.generateProjectSummary
);

router.get(
  '/comments/summary',
  validateCommentSummary,
  validateRequest,
  aiServicesController.summarizeComments
);

module.exports = router;
