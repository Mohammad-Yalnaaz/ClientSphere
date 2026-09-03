'use strict';

/**
 * objectId.validation.js
 *
 * Reusable Mongo ObjectId validator for path/query parameters.
 */

const { param } = require('express-validator');

function validateObjectIdParam(paramName = 'id') {
  return [
    param(paramName)
      .isMongoId()
      .withMessage(`${paramName} must be a valid Mongo ID.`),
  ];
}

module.exports = {
  validateObjectIdParam,
};
