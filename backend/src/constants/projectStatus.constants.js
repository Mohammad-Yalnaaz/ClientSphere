'use strict';

/**
 * projectStatus.constants.js
 *
 * Defines the lifecycle states for the Project entity as established
 * in SRS Chapter 4, FR-PROJ-010 and FR-PROJ-011.
 *
 * A Project is always in exactly one of these states.
 * Frozen to prevent accidental mutation at runtime.
 */

const PROJECT_STATUS = Object.freeze({
  /** Project has been created but work has not yet begun. */
  PLANNING: 'PLANNING',

  /** Work is actively in progress on this project. */
  IN_PROGRESS: 'IN_PROGRESS',

  /** Project is temporarily suspended. */
  ON_HOLD: 'ON_HOLD',

  /** Project work has been completed successfully. */
  COMPLETED: 'COMPLETED',

  /** Project has been abandoned before completion. */
  CANCELLED: 'CANCELLED',

  /** Project is archived (soft-removed from active views). */
  ARCHIVED: 'ARCHIVED',
});

/**
 * Statuses considered "active" — projects in these states appear
 * in normal (non-archived) listings and dashboards.
 */
const ACTIVE_PROJECT_STATUSES = Object.freeze([
  PROJECT_STATUS.PLANNING,
  PROJECT_STATUS.IN_PROGRESS,
  PROJECT_STATUS.ON_HOLD,
]);

/**
 * Terminal statuses — projects cannot be transitioned back to an
 * active state from these without an explicit restore operation.
 */
const TERMINAL_PROJECT_STATUSES = Object.freeze([
  PROJECT_STATUS.COMPLETED,
  PROJECT_STATUS.CANCELLED,
  PROJECT_STATUS.ARCHIVED,
]);

/**
 * Valid status transitions for a Project.
 * Used by the Projects service to enforce FR-PROJ-010.
 * Key: current status → Value: array of permitted next statuses.
 */
const PROJECT_STATUS_TRANSITIONS = Object.freeze({
  [PROJECT_STATUS.PLANNING]: [
    PROJECT_STATUS.IN_PROGRESS,
    PROJECT_STATUS.ON_HOLD,
    PROJECT_STATUS.CANCELLED,
    PROJECT_STATUS.ARCHIVED,
  ],
  [PROJECT_STATUS.IN_PROGRESS]: [
    PROJECT_STATUS.ON_HOLD,
    PROJECT_STATUS.COMPLETED,
    PROJECT_STATUS.CANCELLED,
    PROJECT_STATUS.ARCHIVED,
  ],
  [PROJECT_STATUS.ON_HOLD]: [
    PROJECT_STATUS.IN_PROGRESS,
    PROJECT_STATUS.CANCELLED,
    PROJECT_STATUS.ARCHIVED,
  ],
  [PROJECT_STATUS.COMPLETED]: [PROJECT_STATUS.ARCHIVED],
  [PROJECT_STATUS.CANCELLED]: [PROJECT_STATUS.ARCHIVED],
  // ARCHIVED has no valid outgoing transitions; restore is a separate operation.
  [PROJECT_STATUS.ARCHIVED]: [],
});

module.exports = {
  PROJECT_STATUS,
  ACTIVE_PROJECT_STATUSES,
  TERMINAL_PROJECT_STATUSES,
  PROJECT_STATUS_TRANSITIONS,
};
