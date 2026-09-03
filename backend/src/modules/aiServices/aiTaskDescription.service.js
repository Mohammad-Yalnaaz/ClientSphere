'use strict';

/**
 * aiTaskDescription.service.js
 *
 * Implements the AI Task Description Generator (FR-011, Section 5.13.2).
 * Drafts or refines a structured task description based on title and user hints.
 */

const { generateContent } = require('./gemini.client');
const projectRepo = require('../projects/projects.repository');
const AppError = require('../../utils/appError.util');
const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');

const SYSTEM_INSTRUCTION = `You are an expert project management assistant in ClientSphere.
Your job is to generate clear, structured, and actionable task descriptions based on a task title, project context, and optional user notes.
Use clean markdown with bullet points for objectives, requirements, and acceptance criteria. Keep it concise, practical, and professional.`;

async function generateTaskDescription(projectId, organizationId, { title, context = '' }) {
  // Authorization / Scope check: verify project exists and belongs to this organization
  const project = await projectRepo.findProjectById(projectId, organizationId);
  if (!project) {
    throw new AppError('Project not found.', HTTP_STATUS.NOT_FOUND);
  }

  const prompt = `Project Name: ${project.name}
Task Title: ${title}
Additional Context/Notes: ${context || 'None provided'}

Please generate a structured, professional task description including:
1. Overview / Purpose
2. Key Requirements
3. Definition of Done / Acceptance Criteria`;

  const description = await generateContent(prompt, SYSTEM_INSTRUCTION);
  return { description };
}

module.exports = {
  generateTaskDescription,
};
