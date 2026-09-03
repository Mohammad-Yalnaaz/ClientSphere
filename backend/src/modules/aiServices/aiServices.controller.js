'use strict';

/**
 * aiServices.controller.js
 *
 * Controller handling AI-assisted productivity requests.
 */

const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess } = require('../../utils/apiResponse.util');
const aiTaskDescriptionService = require('./aiTaskDescription.service');
const aiProjectSummaryService = require('./aiProjectSummary.service');
const aiCommentSummaryService = require('./aiCommentSummary.service');

// POST /api/v1/ai/projects/:projectId/generate-task-description
const generateTaskDescription = asyncHandler(async (req, res) => {
  const result = await aiTaskDescriptionService.generateTaskDescription(
    req.params.projectId,
    req.organizationId,
    req.body
  );
  return sendSuccess(res, 'Task description generated successfully.', result);
});

// POST /api/v1/ai/projects/:projectId/summary
const generateProjectSummary = asyncHandler(async (req, res) => {
  const result = await aiProjectSummaryService.generateProjectSummary(
    req.params.projectId,
    req.organizationId
  );
  return sendSuccess(res, 'Project summary generated successfully.', result);
});

// GET /api/v1/ai/comments/summary?entityType=&entityId=
const summarizeComments = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.query;
  const result = await aiCommentSummaryService.summarizeComments(
    entityType,
    entityId,
    req.organizationId,
    req.user
  );
  return sendSuccess(res, 'Comments summarized successfully.', result);
});

module.exports = {
  generateTaskDescription,
  generateProjectSummary,
  summarizeComments,
};
