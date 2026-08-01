'use strict';

/**
 * pagination.util.js
 *
 * Utility for computing pagination parameters from query strings
 * and constructing pagination metadata for API responses.
 *
 * Used by all repository list methods and their calling services to
 * support the pagination requirements in SRS NFR-3 (efficient DB
 * querying) and the pagination conventions in SRS Section 5.2.11.
 *
 * Design decisions:
 * - Hard limits on page size (MAX_LIMIT) prevent clients from
 *   accidentally or maliciously requesting enormous result sets.
 * - parsePagination() normalises and validates inputs so that
 *   repositories receive clean, trusted integers.
 * - buildPaginationMeta() produces the standardised metadata object
 *   attached to every paginated API response under the `pagination`
 *   key (see apiResponse.util.js).
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parses and sanitises pagination query parameters.
 *
 * @param {object} query          - Express req.query object.
 * @param {string} [query.page]   - Requested page number (1-indexed).
 * @param {string} [query.limit]  - Items per page.
 * @returns {{ page: number, limit: number, skip: number }}
 */
function parsePagination(query = {}) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  // Normalise: fall back to defaults for missing, zero, or negative values.
  if (!page || page < 1) page = DEFAULT_PAGE;
  if (!limit || limit < 1) limit = DEFAULT_LIMIT;

  // Enforce maximum page size to prevent abuse.
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Builds the pagination metadata object included in paginated
 * API responses.
 *
 * @param {number} totalItems - Total number of items matching the query.
 * @param {number} page       - Current page number.
 * @param {number} limit      - Items per page.
 * @returns {{
 *   totalItems: number,
 *   totalPages: number,
 *   currentPage: number,
 *   itemsPerPage: number,
 *   hasNextPage: boolean,
 *   hasPreviousPage: boolean
 * }}
 */
function buildPaginationMeta(totalItems, page, limit) {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    totalItems,
    totalPages,
    currentPage: page,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

module.exports = { parsePagination, buildPaginationMeta, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT };
