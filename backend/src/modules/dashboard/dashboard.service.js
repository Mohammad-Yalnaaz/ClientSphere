'use strict';

/**
 * dashboard.service.js
 *
 * Business logic layer for role-specific dashboard views and metrics.
 *
 * Role adaptations (FR-DASH-001 through FR-DASH-004):
 *  - ADMINISTRATOR: Organization-wide totals, project & task breakdown, deadlines, team workload.
 *  - MANAGER: Projects managed or member of, associated tasks, team workload, deadlines.
 *  - EMPLOYEE: Personal tasks assigned, pending work, upcoming deadlines.
 *  - CLIENT: Scoped strictly to client projects and tasks (FR-DASH-005, FR-DASH-015).
 */

const { ROLES } = require('../../constants/roles.constants');
const dashboardRepo = require('./dashboard.repository');
const projectRepo = require('../projects/projects.repository');
const taskRepo = require('../tasks/tasks.repository');
const { DEFAULT_DEADLINE_WINDOW_DAYS } = require('./dashboard.constants');

/**
 * Builds the customized dashboard according to the user's role.
 */
async function getRoleDashboard(user, organizationId, query = {}) {
  const windowDays = Number(query.deadlineDays) || DEFAULT_DEADLINE_WINDOW_DAYS;
  const now = new Date();
  const deadlineEnd = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);

  switch (user.role) {
    case ROLES.ADMINISTRATOR:
      return getAdminDashboard(organizationId, now, deadlineEnd);
    case ROLES.MANAGER:
      return getManagerDashboard(user, organizationId, now, deadlineEnd);
    case ROLES.EMPLOYEE:
      return getEmployeeDashboard(user, organizationId, now, deadlineEnd);
    case ROLES.CLIENT:
      return getClientDashboard(user, organizationId, now, deadlineEnd);
    default:
      return getEmployeeDashboard(user, organizationId, now, deadlineEnd);
  }
}

/**
 * Administrator dashboard: full organization scale visibility (FR-DASH-002, FR-DASH-007)
 */
async function getAdminDashboard(organizationId, startDate, endDate) {
  const [overview, projectStatuses, taskStatuses, deadlines, workload] = await Promise.all([
    dashboardRepo.getOrganizationOverview(organizationId),
    dashboardRepo.getProjectStatusDistribution(organizationId),
    dashboardRepo.getTaskStatusDistribution(organizationId),
    dashboardRepo.getUpcomingDeadlines(organizationId, startDate, endDate),
    dashboardRepo.getTeamWorkload(organizationId),
  ]);

  return {
    role: ROLES.ADMINISTRATOR,
    overview,
    projectStatuses,
    taskStatuses,
    upcomingDeadlines: deadlines,
    teamWorkload: workload,
  };
}

/**
 * Manager dashboard: projects overseen, team workload, upcoming deadlines (FR-DASH-003)
 */
async function getManagerDashboard(user, organizationId, startDate, endDate) {
  // Find projects where manager is in managers or members list
  const managedProjects = await projectRepo.findProjects(
    {
      organizationId,
      $or: [{ managers: user._id }, { members: user._id }, { createdBy: user._id }],
      status: { $ne: 'ARCHIVED' },
    },
    { limit: 50 }
  );

  const projectIds = managedProjects.map((p) => p._id);

  const [projectStatuses, taskStatuses, deadlines, workload] = await Promise.all([
    dashboardRepo.getProjectStatusDistribution(organizationId, { _id: { $in: projectIds } }),
    dashboardRepo.getTaskStatusDistribution(organizationId, { projectId: { $in: projectIds } }),
    dashboardRepo.getUpcomingDeadlines(
      organizationId,
      startDate,
      endDate,
      { _id: { $in: projectIds } },
      { projectId: { $in: projectIds } }
    ),
    dashboardRepo.getTeamWorkload(organizationId, projectIds),
  ]);

  return {
    role: ROLES.MANAGER,
    managedProjectsCount: managedProjects.length,
    projectStatuses,
    taskStatuses,
    upcomingDeadlines: deadlines,
    teamWorkload: workload,
  };
}

/**
 * Employee dashboard: personal assigned tasks, deadlines, pending items (FR-DASH-004, FR-TASK-022)
 */
async function getEmployeeDashboard(user, organizationId, startDate, endDate) {
  const [myTasks, taskStatuses, deadlines] = await Promise.all([
    taskRepo.findTasks(
      {
        organizationId,
        assignedTo: user._id,
        status: { $in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] },
      },
      { limit: 10, sort: { dueDate: 1, priority: -1 } }
    ),
    dashboardRepo.getTaskStatusDistribution(organizationId, { assignedTo: user._id }),
    dashboardRepo.getUpcomingDeadlines(
      organizationId,
      startDate,
      endDate,
      {},
      { assignedTo: user._id }
    ),
  ]);

  return {
    role: ROLES.EMPLOYEE,
    assignedTasksCount: myTasks.length,
    recentTasks: myTasks.map((t) => t.toJSON()),
    taskStatuses,
    upcomingDeadlines: {
      tasks: deadlines.tasks,
    },
  };
}

/**
 * Client dashboard: strictly scoped to projects belonging to their client account (FR-DASH-015)
 */
async function getClientDashboard(user, organizationId, startDate, endDate) {
  // If user has a clientId associated, scope to that client
  const clientFilter = user.clientId ? { clientId: user.clientId } : {};

  const clientProjects = await projectRepo.findProjects(
    {
      organizationId,
      ...clientFilter,
      status: { $ne: 'ARCHIVED' },
    },
    { limit: 20 }
  );

  const projectIds = clientProjects.map((p) => p._id);

  const [projectStatuses, deadlines] = await Promise.all([
    dashboardRepo.getProjectStatusDistribution(organizationId, { _id: { $in: projectIds } }),
    dashboardRepo.getUpcomingDeadlines(
      organizationId,
      startDate,
      endDate,
      { _id: { $in: projectIds } },
      { projectId: { $in: projectIds } }
    ),
  ]);

  return {
    role: ROLES.CLIENT,
    projectsCount: clientProjects.length,
    projects: clientProjects.map((p) => p.toJSON()),
    projectStatuses,
    upcomingDeadlines: deadlines,
  };
}

module.exports = {
  getRoleDashboard,
  getAdminDashboard,
  getManagerDashboard,
  getEmployeeDashboard,
  getClientDashboard,
};
