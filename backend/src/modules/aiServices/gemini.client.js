'use strict';

/**
 * gemini.client.js
 *
 * Client wrapper for Google Gemini API via @google/genai.
 *
 * Key SRS Guarantees:
 *  - Graceful degradation: If GEMINI_API_KEY is missing or the external call fails,
 *    it throws an AppError without affecting any core application flows (NFR-4).
 *  - Strictly assistive: Generates text content only; no persistent record or DB mutation.
 */

const { GoogleGenAI } = require('@google/genai');
const geminiConfig = require('../../config/gemini.config');
const AppError = require('../../utils/appError.util');
const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');
const logger = require('../../utils/logger.util');

let aiClient = null;

function getAIClient() {
  if (!geminiConfig.apiKey) {
    throw new AppError(
      'Gemini AI service is currently unavailable (API key not configured).',
      HTTP_STATUS.SERVICE_UNAVAILABLE
    );
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: geminiConfig.apiKey });
  }

  return aiClient;
}

/**
 * Generates text from a system prompt and user input.
 *
 * @param {string} prompt
 * @param {string} [systemInstruction]
 * @returns {Promise<string>}
 */
async function generateContent(prompt, systemInstruction = '') {
  try {
    const ai = getAIClient();

    const response = await ai.models.generateContent({
      model: geminiConfig.model,
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    return response.text ? response.text.trim() : '';
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error(`[Gemini] Error generating content: ${err.message}`);
    throw new AppError(
      'AI content generation failed. Please try again later.',
      HTTP_STATUS.BAD_GATEWAY
    );
  }
}

module.exports = {
  generateContent,
};
