'use strict';

/**
 * dashboard.controller.js
 *
 * Controller handling dashboard requests.
 */

const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess } = require('../../utils/apiResponse.util');
const dashboardService = require('./dashboard.service');

// ── GET /api/v1/dashboard ──────────────────────────────────────────────────────
const getDashboard = asyncHandler(async (req, res) => {
  const dashboardData = await dashboardService.getRoleDashboard(
    req.user,
    req.organizationId,
    req.query
  );

  return sendSuccess(res, 'Dashboard data retrieved successfully.', {
    dashboard: dashboardData,
  });
});

module.exports = {
  getDashboard,
};
