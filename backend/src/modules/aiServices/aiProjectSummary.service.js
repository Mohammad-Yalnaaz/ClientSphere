'use strict';

/**
 * aiProjectSummary.service.js
 *
 * Implements the AI Project Summary Generator (FR-011, Section 5.13.3).
 * Summarizes the project's state, tasks, timeline, and priorities.
 */

const { generateContent } = require('./gemini.client');
const projectRepo = require('../projects/projects.repository');
const taskRepo = require('../tasks/tasks.repository');
const AppError = require('../../utils/appError.util');
const HTTP_STATUS = require('../../constants/httpStatusCodes.constants');

const SYSTEM_INSTRUCTION = `You are an executive project management consultant in ClientSphere.
Your task is to analyze project details, task metrics, and deadlines, and produce an executive status summary.
Highlight current progress, major achievements, overdue or high-priority risks, and recommended next steps.`;

async function generateProjectSummary(projectId, organizationId) {
  const project = await projectRepo.findProjectById(projectId, organizationId);
  if (!project) {
    throw new AppError('Project not found.', HTTP_STATUS.NOT_FOUND);
  }

  // Fetch project tasks for context
  const tasks = await taskRepo.findTasks({ projectId, organizationId }, { limit: 50 });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length;
  const pending = tasks.filter((t) => t.status === 'TODO').length;
  const critical = tasks.filter((t) => t.priority === 'CRITICAL' || t.priority === 'HIGH').map((t) => t.title);

  const prompt = `Project: ${project.name}
Status: ${project.status}
Priority: ${project.priority}
Start Date: ${project.startDate ? project.startDate.toISOString().split('T')[0] : 'N/A'}
Due Date: ${project.dueDate ? project.dueDate.toISOString().split('T')[0] : 'N/A'}

Task Summary:
- Total Tasks: ${total}
- Completed: ${completed} (${total > 0 ? Math.round((completed / total) * 100) : 0}%)
- In Progress/Review: ${inProgress}
- Pending/Todo: ${pending}
- Key High-Priority Tasks: ${critical.length > 0 ? critical.join(', ') : 'None'}

Please provide an executive summary with:
- High-Level Health & Progress
- Critical Areas & Risks
- Recommended Action Items`;

  const summary = await generateContent(prompt, SYSTEM_INSTRUCTION);
  return { summary };
}

module.exports = {
  generateProjectSummary,
};
