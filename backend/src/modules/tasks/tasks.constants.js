'use strict';

/**
 * tasks.constants.js
 *
 * Status and priority enums for the Task entity.
 *
 * Exported separately so they can be imported by model, service,
 * validation, and controller layers without circular dependencies.
 *
 * SRS references:
 *  - FR-TASK-014 (Task Status Transitions)
 *  - FR-TASK-013 (Priority Levels)
 *  - FR-TASK-024 (Prevent Invalid Status Transitions)
 */

/**
 * Valid lifecycle states for a Task.
 *
 * TODO       → Work has not started yet.
 * IN_PROGRESS → Work is actively being done.
 * IN_REVIEW  → Work is done and awaiting review/approval.
 * COMPLETED  → Work has been accepted as finished (FR-TASK-016).
 * CANCELLED  → Task has been stopped without completion.
 * ARCHIVED   → Task is removed from active views (FR-TASK-003).
 */
const TASK_STATUSES = Object.freeze({
  TODO:        'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW:   'IN_REVIEW',
  COMPLETED:   'COMPLETED',
  CANCELLED:   'CANCELLED',
  ARCHIVED:    'ARCHIVED',
});

/**
 * Valid priority levels for a Task (mirrors project priorities).
 * (FR-TASK-013)
 */
const TASK_PRIORITIES = Object.freeze({
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

/**
 * Terminal states — a task in one of these cannot be transitioned further
 * except to ARCHIVED. (FR-TASK-024)
 */
const TERMINAL_TASK_STATUSES = Object.freeze([
  TASK_STATUSES.COMPLETED,
  TASK_STATUSES.CANCELLED,
]);

/**
 * Valid forward-only status transitions.
 * A task can only move to statuses listed in its entry.
 * (FR-TASK-024)
 *
 * Admins and Managers can override transitions; employees are constrained.
 */
const VALID_TASK_TRANSITIONS = Object.freeze({
  [TASK_STATUSES.TODO]:        [TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.IN_PROGRESS]: [TASK_STATUSES.IN_REVIEW,   TASK_STATUSES.TODO, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.IN_REVIEW]:   [TASK_STATUSES.COMPLETED,   TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.COMPLETED]:   [TASK_STATUSES.IN_PROGRESS],
  [TASK_STATUSES.CANCELLED]:   [TASK_STATUSES.TODO],
  [TASK_STATUSES.ARCHIVED]:    [],
});

module.exports = {
  TASK_STATUSES,
  TASK_PRIORITIES,
  TERMINAL_TASK_STATUSES,
  VALID_TASK_TRANSITIONS,
};
