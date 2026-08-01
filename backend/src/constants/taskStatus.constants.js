'use strict';

/**
 * taskStatus.constants.js
 *
 * Defines the lifecycle states for the Task entity as established
 * in SRS Chapter 4, FR-TASK-014.
 *
 * A Task is always in exactly one of these states.
 * Frozen to prevent accidental mutation at runtime.
 */

const TASK_STATUS = Object.freeze({
  /** Task has been created and is awaiting action. */
  TODO: 'TODO',

  /** An assignee is actively working on this task. */
  IN_PROGRESS: 'IN_PROGRESS',

  /** Work is complete; awaiting review or approval. */
  IN_REVIEW: 'IN_REVIEW',

  /** Task has been completed and accepted. */
  COMPLETED: 'COMPLETED',

  /** Task has been abandoned before completion. */
  CANCELLED: 'CANCELLED',

  /** Task is archived (soft-removed from active views). */
  ARCHIVED: 'ARCHIVED',
});

/**
 * Statuses considered "active" — tasks in these states appear in
 * normal (non-archived) listings and contribute to project progress.
 */
const ACTIVE_TASK_STATUSES = Object.freeze([
  TASK_STATUS.TODO,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.IN_REVIEW,
]);

/**
 * Valid status transitions for a Task.
 * Used by the Tasks service to enforce FR-TASK-014 and FR-TASK-024.
 * Key: current status → Value: array of permitted next statuses.
 */
const TASK_STATUS_TRANSITIONS = Object.freeze({
  [TASK_STATUS.TODO]: [
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.CANCELLED,
    TASK_STATUS.ARCHIVED,
  ],
  [TASK_STATUS.IN_PROGRESS]: [
    TASK_STATUS.IN_REVIEW,
    TASK_STATUS.TODO,
    TASK_STATUS.CANCELLED,
    TASK_STATUS.ARCHIVED,
  ],
  [TASK_STATUS.IN_REVIEW]: [
    TASK_STATUS.COMPLETED,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.CANCELLED,
    TASK_STATUS.ARCHIVED,
  ],
  [TASK_STATUS.COMPLETED]: [TASK_STATUS.ARCHIVED],
  [TASK_STATUS.CANCELLED]: [TASK_STATUS.ARCHIVED],
  // ARCHIVED has no valid outgoing transitions; restore is a separate operation.
  [TASK_STATUS.ARCHIVED]: [],
});

/**
 * Priority levels available for tasks and projects.
 * Derived from SRS FR-TASK-013 and FR-PROJ-012.
 */
const PRIORITY = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
});

module.exports = { TASK_STATUS, ACTIVE_TASK_STATUSES, TASK_STATUS_TRANSITIONS, PRIORITY };
