'use strict';

/**
 * routes/index.js
 *
 * Central API router for ClientSphere.
 *
 * All domain module sub-routers are mounted here under /api/v1/.
 * This file is the single place where URL structure is defined —
 * no individual module router decides its own prefix.
 *
 * Design decisions:
 * - A health-check route (/api/v1/health) is registered unconditionally
 *   so that Render's uptime checks succeed from Module 1 onward.
 * - Module sub-routers are commented out with a clear MODULE label.
 *   Each will be uncommented exactly once when that module ships.
 *   This keeps the routing structure visible for the full project
 *   without attempting to require() files that don't exist yet.
 * - The router prefix (/api/v1) is applied in app.js, not here,
 *   so this file remains agnostic of deployment path configuration.
 */

const { Router } = require('express');
const HTTP_STATUS = require('../constants/httpStatusCodes.constants');

const router = Router();

// ─── Health Check ─────────────────────────────────────────────────────────────
// Available immediately from Module 1.
// Used by Render health checks and monitoring.

router.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'ClientSphere API is running.',
    data: {
      status: 'healthy',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

// ─── Module Sub-Routers ──────────────────────────────────────────────────────
// Each line below will be uncommented when the corresponding module ships.
// Do NOT uncomment a module until its router file is implemented.

// MODULE 2 – Authentication
const authRouter = require('../modules/auth/auth.routes');
router.use('/auth', authRouter);

// MODULE 3 – Organizations
const organizationsRouter = require('../modules/organizations/organizations.routes');
router.use('/organizations', organizationsRouter);

// MODULE 4 – Users
const usersRouter = require('../modules/users/users.routes');
router.use('/users', usersRouter);

// MODULE 5 – Clients
const clientsRouter = require('../modules/clients/clients.routes');
router.use('/clients', clientsRouter);

// MODULE 6 – Projects
const projectsRouter = require('../modules/projects/projects.routes');
router.use('/projects', projectsRouter);

// MODULE 7 – Tasks (nested under projects)
const tasksRouter = require('../modules/tasks/tasks.routes');
router.use('/projects/:projectId/tasks', tasksRouter);

// MODULE 8 – Comments
// const commentsRouter = require('../modules/comments/comments.routes');
// router.use('/comments', commentsRouter);

// MODULE 9 – Files
// const filesRouter = require('../modules/files/files.routes');
// router.use('/files', filesRouter);

// MODULE 10 – Notifications
// const notificationsRouter = require('../modules/notifications/notifications.routes');
// router.use('/notifications', notificationsRouter);

// MODULE 11 – Dashboard & Analytics
// const dashboardRouter = require('../modules/dashboard/dashboard.routes');
// router.use('/dashboard', dashboardRouter);

// MODULE 12 – Activity Logs
// const activityLogsRouter = require('../modules/activityLogs/activityLogs.routes');
// router.use('/activity-logs', activityLogsRouter);

// MODULE 13 – Search
// const searchRouter = require('../modules/search/search.routes');
// router.use('/search', searchRouter);

// MODULE 14 – AI Services
// const aiServicesRouter = require('../modules/aiServices/aiServices.routes');
// router.use('/ai', aiServicesRouter);

module.exports = router;
