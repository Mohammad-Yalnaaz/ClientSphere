'use strict';

/**
 * dashboard.repository.js
 *
 * Direct aggregate calculations and queries across Mongoose models for Dashboard.
 *
 * Requirements:
 *  - getOrganizationOverview: summary counts of clients, projects, users, tasks.
 *  - getProjectStatusCounts: distribution of projects by status.
 *  - getTaskStatusCounts: distribution of tasks by status.
 *  - getUpcomingDeadlines: projects and tasks due within a date window.
 *  - getTeamWorkload: count of pending tasks assigned per team member.
 */

const mongoose = require('mongoose');
const Client = require('../clients/clients.model');
const Project = require('../projects/projects.model');
const Task = require('../tasks/tasks.model');
const User = require('../users/users.model');
const { PROJECT_STATUSES } = require('../projects/projects.constants');
const { TASK_STATUSES } = require('../tasks/tasks.constants');

/**
 * Organization-wide overview (FR-DASH-002, FR-DASH-007)
 */
async function getOrganizationOverview(organizationId) {
  const orgId = new mongoose.Types.ObjectId(organizationId);

  const [activeClients, activeProjects, totalProjects, activeUsers, totalTasks, pendingTasks] =
    await Promise.all([
      Client.countDocuments({ organizationId: orgId, status: 'ACTIVE' }),
      Project.countDocuments({ organizationId: orgId, status: PROJECT_STATUSES.ACTIVE }),
      Project.countDocuments({ organizationId: orgId, status: { $ne: PROJECT_STATUSES.ARCHIVED } }),
      User.countDocuments({ organizationId: orgId, isActive: true }),
      Task.countDocuments({ organizationId: orgId, status: { $ne: TASK_STATUSES.ARCHIVED } }),
      Task.countDocuments({
        organizationId: orgId,
        status: { $in: [TASK_STATUSES.TODO, TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.IN_REVIEW] },
      }),
    ]);

  return {
    activeClients,
    activeProjects,
    totalProjects,
    activeUsers,
    totalTasks,
    pendingTasks,
  };
}

/**
 * Project count breakdown by status.
 */
async function getProjectStatusDistribution(organizationId, filter = {}) {
  const orgId = new mongoose.Types.ObjectId(organizationId);
  return Project.aggregate([
    { $match: { organizationId: orgId, ...filter } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
}

/**
 * Task count breakdown by status.
 */
async function getTaskStatusDistribution(organizationId, filter = {}) {
  const orgId = new mongoose.Types.ObjectId(organizationId);
  return Task.aggregate([
    { $match: { organizationId: orgId, ...filter } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
}

/**
 * Upcoming deadlines for projects and tasks (FR-DASH-012)
 */
async function getUpcomingDeadlines(organizationId, startDate, endDate, projectFilter = {}, taskFilter = {}) {
  const orgId = new mongoose.Types.ObjectId(organizationId);

  const [projects, tasks] = await Promise.all([
    Project.find({
      organizationId: orgId,
      dueDate: { $gte: startDate, $lte: endDate },
      status: { $in: [PROJECT_STATUSES.PLANNING, PROJECT_STATUSES.ACTIVE] },
      ...projectFilter,
    })
      .select('name status priority dueDate clientId')
      .populate('clientId', 'name')
      .sort({ dueDate: 1 })
      .limit(10),

    Task.find({
      organizationId: orgId,
      dueDate: { $gte: startDate, $lte: endDate },
      status: { $in: [TASK_STATUSES.TODO, TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.IN_REVIEW] },
      ...taskFilter,
    })
      .select('title status priority dueDate projectId assignedTo')
      .populate('projectId', 'name')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ dueDate: 1 })
      .limit(15),
  ]);

  return { projects, tasks };
}

/**
 * Team workload distribution (FR-DASH-013)
 * Aggregates pending tasks assigned to each user.
 */
async function getTeamWorkload(organizationId, projectIds = null) {
  const orgId = new mongoose.Types.ObjectId(organizationId);
  const matchStage = {
    organizationId: orgId,
    assignedTo: { $ne: null },
    status: { $in: [TASK_STATUSES.TODO, TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.IN_REVIEW] },
  };

  if (projectIds && projectIds.length > 0) {
    matchStage.projectId = { $in: projectIds.map((id) => new mongoose.Types.ObjectId(id)) };
  }

  return Task.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$assignedTo',
        taskCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 1,
        taskCount: 1,
        firstName: '$user.firstName',
        lastName: '$user.lastName',
        email: '$user.email',
        role: '$user.role',
      },
    },
    { $sort: { taskCount: -1 } },
  ]);
}

module.exports = {
  getOrganizationOverview,
  getProjectStatusDistribution,
  getTaskStatusDistribution,
  getUpcomingDeadlines,
  getTeamWorkload,
};
