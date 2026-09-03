'use strict';

/**
 * activityLogs.controller.js
 *
 * Controller handling activity logs requests.
 */

const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess } = require('../../utils/apiResponse.util');
const activityLogService = require('./activityLogs.service');

// ── GET /api/v1/activity-logs ──────────────────────────────────────────────────
const listActivityLogs = asyncHandler(async (req, res) => {
  const result = await activityLogService.listActivityLogs(
    req.organizationId,
    req.user,
    req.query
  );

  return sendSuccess(
    res,
    'Activity logs retrieved successfully.',
    { logs: result.logs },
    200,
    {
      total: result.total,
      page: result.page,
      limit: result.limit,
    }
  );
});

module.exports = {
  listActivityLogs,
};
