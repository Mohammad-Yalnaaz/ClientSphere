'use strict';

/**
 * cloudinary.config.js
 *
 * Configures the Cloudinary SDK for file upload and management.
 * Called once at server startup.
 *
 * Environment variables required:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *
 * SRS reference: Chapter 2 Section 2.7 (File Storage Architecture)
 */

const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger.util');

function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    logger.warn('[Cloudinary] Missing credentials — file upload will be unavailable.');
    return;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key:    CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure:     true,
  });

  logger.info('[Cloudinary] SDK configured successfully.');
}

module.exports = { cloudinary, configureCloudinary };
