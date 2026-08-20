'use strict';

/**
 * projects.constants.js
 *
 * Status and priority enums for the Project entity.
 *
 * Exported separately so they can be imported by:
 *  - projects.model.js (schema enum validation)
 *  - projects.service.js (business rule checks)
 *  - projects.validation.js (request validation)
 *  - projects.controller.js (response shaping)
 *
 * SRS references:
 *  - FR-PROJ-010 (Project Lifecycle)
 *  - FR-PROJ-011 (Project Status Management)
 *  - FR-PROJ-012 (Priority Management)
 */

/**
 * Valid lifecycle states for a Project.
 *
 * PLANNING   → Work has not yet started; project is being scoped.
 * ACTIVE     → Work is in progress.
 * ON_HOLD    → Work is temporarily paused.
 * COMPLETED  → All deliverables have been finished.
 * CANCELLED  → Project has been terminated before completion.
 * ARCHIVED   → Project is closed and moved out of active views (FR-PROJ-004).
 */
const PROJECT_STATUSES = Object.freeze({
  PLANNING:  'PLANNING',
  ACTIVE:    'ACTIVE',
  ON_HOLD:   'ON_HOLD',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  ARCHIVED:  'ARCHIVED',
});

/**
 * Valid priority levels for a Project.
 * (FR-PROJ-012)
 */
const PROJECT_PRIORITIES = Object.freeze({
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

/**
 * Statuses that represent a "closed" project — used for business rule
 * enforcement (e.g. preventing task creation in closed projects).
 */
const CLOSED_PROJECT_STATUSES = Object.freeze([
  PROJECT_STATUSES.COMPLETED,
  PROJECT_STATUSES.CANCELLED,
  PROJECT_STATUSES.ARCHIVED,
]);

module.exports = {
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  CLOSED_PROJECT_STATUSES,
};
