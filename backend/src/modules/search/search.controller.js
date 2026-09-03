'use strict';

/**
 * search.controller.js
 *
 * Controller for handling global search queries.
 */

const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess } = require('../../utils/apiResponse.util');
const searchService = require('./search.service');

// ── GET /api/v1/search ─────────────────────────────────────────────────────────
const search = asyncHandler(async (req, res) => {
  const results = await searchService.globalSearch(
    req.user,
    req.organizationId,
    req.query
  );

  return sendSuccess(res, 'Search completed successfully.', results);
});

module.exports = {
  search,
};
