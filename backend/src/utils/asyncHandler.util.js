'use strict';

/**
 * asyncHandler.util.js
 *
 * Higher-order function that wraps an async Express route handler
 * and forwards any rejected promise to Express's next(err) mechanism.
 *
 * Design decisions:
 * - Eliminates try/catch boilerplate from every controller function,
 *   keeping controllers thin per ARCHITECTURE_DECISIONS.md §9.
 * - Any AppError or unexpected Error thrown inside a wrapped handler
 *   flows directly to the centralized errorHandler middleware.
 * - Works transparently with Express 4 and Express 5. Under Express 4,
 *   unhandled promise rejections in route handlers are silent by default;
 *   this wrapper makes them explicit.
 *
 * Usage:
 *   router.get('/resource', asyncHandler(async (req, res) => {
 *     const data = await someService.getAll();
 *     res.json(data);
 *   }));
 *
 * @param {Function} fn - An async Express request handler.
 * @returns {Function} A standard Express middleware function.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
