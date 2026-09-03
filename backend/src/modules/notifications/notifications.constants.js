'use strict';

/**
 * notifications.constants.js
 *
 * Enums and constants for the Notification entity.
 *
 * SRS references:
 *  - FR-NOTIFY-001 through FR-NOTIFY-007 (Triggering event types)
 *  - FR-NOTIFY-008 (Prioritization: HIGH vs NORMAL)
 *  - FR-NOTIFY-009 (Read/Unread state)
 */

/**
 * Event types that trigger notifications.
 */
const NOTIFICATION_TYPES = Object.freeze({
  TASK_ASSIGNED:     'TASK_ASSIGNED',     // FR-NOTIFY-002
  TASK_REASSIGNED:   'TASK_REASSIGNED',   // FR-NOTIFY-003
  STATUS_CHANGED:    'STATUS_CHANGED',    // FR-NOTIFY-004
  COMMENT_ADDED:     'COMMENT_ADDED',     // FR-NOTIFY-005
  MENTIONED:         'MENTIONED',         // FR-NOTIFY-006
  PROJECT_UPDATED:   'PROJECT_UPDATED',   // FR-NOTIFY-007
});

/**
 * Priority levels for notification delivery and display (FR-NOTIFY-008).
 * High urgency: TASK_ASSIGNED, MENTIONED
 * Normal urgency: STATUS_CHANGED, COMMENT_ADDED, PROJECT_UPDATED
 */
const NOTIFICATION_PRIORITIES = Object.freeze({
  HIGH:   'HIGH',
  NORMAL: 'NORMAL',
  LOW:    'LOW',
});

/**
 * Associated entity types for contextual navigation.
 */
const NOTIFICATION_ENTITY_TYPES = Object.freeze({
  TASK:    'TASK',
  PROJECT: 'PROJECT',
  COMMENT: 'COMMENT',
});

module.exports = {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_ENTITY_TYPES,
};
