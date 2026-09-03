'use strict';

/**
 * search.service.js
 *
 * Implements Global Search & Cross-Entity Filtering (FR-010, Section 4.13, Section 5.11).
 * Searches across Clients, Projects, and Tasks respecting organizational data isolation (FR-SEARCH-016)
 * and role-based visibility (FR-SEARCH-015).
 */

const Client = require('../clients/clients.model');
const Project = require('../projects/projects.model');
const Task = require('../tasks/tasks.model');
const { ROLES } = require('../../constants/roles.constants');

/**
 * Searches across Clients, Projects, and Tasks with keyword query and filters.
 */
async function globalSearch(user, organizationId, query = {}) {
  const { q = '', status, priority, limit = 10 } = query;
  const searchLimit = Math.min(Number(limit), 20);

  const cleanQuery = q.trim();
  const regex = cleanQuery ? new RegExp(cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;

  // 1. Client Search (Admin & Manager can see org clients; Employee see clients of their projects; Client see self)
  let clientsPromise = Promise.resolve([]);
  if (user.role === ROLES.ADMINISTRATOR || user.role === ROLES.MANAGER) {
    const clientFilter = { organizationId, status: { $ne: 'ARCHIVED' } };
    if (regex) clientFilter.name = regex;
    if (status) clientFilter.status = status;

    clientsPromise = Client.find(clientFilter)
      .select('name email industry status')
      .limit(searchLimit);
  }

  // 2. Project Search (Admin sees all; Manager/Employee sees member/assigned; Client sees self client)
  const projectFilter = { organizationId, status: { $ne: 'ARCHIVED' } };
  if (regex) projectFilter.name = regex;
  if (status) projectFilter.status = status;
  if (priority) projectFilter.priority = priority;

  if (user.role === ROLES.EMPLOYEE) {
    projectFilter.$or = [{ members: user._id }, { managers: user._id }];
  } else if (user.role === ROLES.CLIENT && user.clientId) {
    projectFilter.clientId = user.clientId;
  }

  const projectsPromise = Project.find(projectFilter)
    .select('name status priority startDate dueDate clientId')
    .populate('clientId', 'name')
    .limit(searchLimit);

  // 3. Task Search
  const taskFilter = { organizationId, status: { $ne: 'ARCHIVED' } };
  if (regex) taskFilter.title = regex;
  if (status) taskFilter.status = status;
  if (priority) taskFilter.priority = priority;

  if (user.role === ROLES.EMPLOYEE) {
    taskFilter.assignedTo = user._id;
  }

  const tasksPromise = Task.find(taskFilter)
    .select('title status priority dueDate projectId assignedTo')
    .populate('projectId', 'name')
    .populate('assignedTo', 'firstName lastName email')
    .limit(searchLimit);

  const [clients, projects, tasks] = await Promise.all([
    clientsPromise,
    projectsPromise,
    tasksPromise,
  ]);

  return {
    query: cleanQuery,
    totalResults: clients.length + projects.length + tasks.length,
    results: {
      clients: clients.map((c) => c.toJSON()),
      projects: projects.map((p) => p.toJSON()),
      tasks: tasks.map((t) => t.toJSON()),
    },
  };
}

module.exports = {
  globalSearch,
};
