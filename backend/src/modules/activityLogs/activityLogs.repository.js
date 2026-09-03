'use strict';

/**
 * activityLogs.repository.js
 *
 * Database access layer for Activity Logs.
 *
 * Strictly append-only (Section 5.12.1):
 *  - createActivityLog: writes a new log entry.
 *  - findActivityLogs: queries logs with filtering, pagination, and actor population.
 *  - countActivityLogs: total count for pagination metadata.
 *  - NO update or delete operations exist.
 */

const ActivityLog = require('./activityLogs.model');

async function createActivityLog(data) {
  return ActivityLog.create(data);
}

async function findActivityLogs(filter, options = {}) {
  const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;
  return ActivityLog.find(filter)
    .populate('userId', 'firstName lastName email role avatarUrl')
    .skip(skip)
    .limit(limit)
    .sort(sort);
}

async function countActivityLogs(filter) {
  return ActivityLog.countDocuments(filter);
}

module.exports = {
  createActivityLog,
  findActivityLogs,
  countActivityLogs,
};
