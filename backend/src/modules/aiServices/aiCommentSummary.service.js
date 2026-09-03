'use strict';

/**
 * aiCommentSummary.service.js
 *
 * Implements the AI Comment Summarizer (FR-011, Section 5.13.4).
 * Summarizes discussion threads on a Task or Project, adhering to visibility boundaries.
 */

const { generateContent } = require('./gemini.client');
const commentRepo = require('../comments/comments.repository');
const { ROLES } = require('../../constants/roles.constants');

const SYSTEM_INSTRUCTION = `You are a team collaboration assistant in ClientSphere.
Summarize the following discussion thread clearly and objectively.
Highlight:
- Key decisions made
- Main points of discussion/debate
- Action items or unresolved questions
Keep the summary concise and focused on outcomes.`;

async function summarizeComments(entityType, entityId, organizationId, requestingUser) {
  const visibilityFilter =
    requestingUser.role === ROLES.CLIENT ? { visibility: 'CLIENT' } : {};

  const comments = await commentRepo.findCommentsByEntity(entityId, entityType, visibilityFilter);

  if (comments.length === 0) {
    return {
      summary: 'No discussion comments found to summarize.',
    };
  }

  const formattedThread = comments
    .map((c, i) => `[Comment ${i + 1}] (${new Date(c.createdAt).toLocaleDateString()}): ${c.content}`)
    .join('\n\n');

  const prompt = `Entity: ${entityType} (${entityId})
Discussion thread containing ${comments.length} comments:

${formattedThread}

Please generate a concise summary highlighting decisions, action items, and next steps.`;

  const summary = await generateContent(prompt, SYSTEM_INSTRUCTION);
  return { summary };
}

module.exports = {
  summarizeComments,
};
