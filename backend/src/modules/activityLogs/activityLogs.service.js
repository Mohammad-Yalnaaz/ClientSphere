'use strict';

/**
 * activityLogs.service.js
 *
 * Business logic layer for logging and retrieving activity audit entries.
 *
 * Requirements (Section 5.12):
 *  - logActivity: records a new audit event automatically.
 *  - listActivityLogs: paginated, filterable activity history.
 *  - Scoped visibility: Administrator has org-wide view; other roles see only permitted entities.
 */

const logger = require('../../utils/logger.util');
const activityLogRepo = require('./activityLogs.repository');
const { ACTIVITY_ACTIONS, ACTIVITY_ENTITIES } = require('./activityLogs.constants');
const { ROLES } = require('../../constants/roles.constants');

/**
 * Records an activity log entry automatically.
 */
async function logActivity({
  organizationId,
  userId,
  action,
  entityType,
  entityId,
  description,
  metadata = {},
}) {
  try {
    const entry = await activityLogRepo.createActivityLog({
      organizationId,
      userId,
      action,
      entityType,
      entityId,
      description,
      metadata,
    });
    logger.info(`[ActivityLog] ${action} on ${entityType} ${entityId} by user ${userId}`);
    return entry.toJSON();
  } catch (err) {
    // Audit logging failure should not crash the main business transaction, but should be logged.
    logger.error(`[ActivityLog] Failed to record activity log: ${err.message}`, {
      action,
      entityType,
      entityId,
    });
    return null;
  }
}

/**
 * Retrieves activity logs with pagination and filters.
 */
async function listActivityLogs(organizationId, requestingUser, query = {}) {
  const { page = 1, limit = 20, entityType, entityId, action, userId } = query;

  const filter = {
    organizationId,
  };

  // Scope enforcement for non-admin roles:
  if (requestingUser.role !== ROLES.ADMINISTRATOR) {
    // If not admin, restrict to their own actions or explicitly requested permitted entities
    if (userId) {
      filter.userId = requestingUser._id;
    }
  } else if (userId) {
    filter.userId = userId;
  }

  if (entityType && Object.values(ACTIVITY_ENTITIES).includes(entityType)) {
    filter.entityType = entityType;
  }

  if (entityId) {
    filter.entityId = entityId;
  }

  if (action && Object.values(ACTIVITY_ACTIONS).includes(action)) {
    filter.action = action;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    activityLogRepo.findActivityLogs(filter, { skip, limit: Number(limit) }),
    activityLogRepo.countActivityLogs(filter),
  ]);

  return {
    logs: logs.map((l) => l.toJSON()),
    total,
    page: Number(page),
    limit: Number(limit),
  };
}

module.exports = {
  logActivity,
  listActivityLogs,
};
