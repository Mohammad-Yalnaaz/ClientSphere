'use strict';

/**
 * gemini.config.js
 *
 * Configuration for Google Gemini AI integration.
 *
 * SRS references:
 *  - Chapter 1 Section 1.6 (FR-011)
 *  - Chapter 2 Section 2.2 (AI Integration via Google Gemini API)
 *  - Chapter 5 Section 5.13 (AI Services API)
 */

module.exports = {
  apiKey: process.env.GEMINI_API_KEY || null,
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
};
