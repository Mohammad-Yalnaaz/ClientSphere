'use strict';

/**
 * notificationTypes.constants.js
 *
 * Defines the event types that can trigger a Notification, as
 * specified in SRS Chapter 4 (Section 4.11) and Chapter 3 (Section 3.4.8).
 *
 * These types are stored on Notification documents and are used:
 * - In FR-NOTIFY-002 through FR-NOTIFY-007 to identify triggering events.
 * - In FR-NOTIFY-008 to distinguish higher-urgency from lower-urgency events.
 * - In FR-NOTIFY-013 to allow users to filter their notification list.
 * - By the Socket.io layer to emit appropriately typed real-time events.
 *
 * Frozen to prevent accidental mutation at runtime.
 */

const NOTIFICATION_TYPE = Object.freeze({
  // Task-related (FR-NOTIFY-002, FR-NOTIFY-003)
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_REASSIGNED: 'TASK_REASSIGNED',
  TASK_STATUS_CHANGED: 'TASK_STATUS_CHANGED',
  TASK_DUE_SOON: 'TASK_DUE_SOON',

  // Project-related (FR-NOTIFY-004, FR-NOTIFY-007)
  PROJECT_STATUS_CHANGED: 'PROJECT_STATUS_CHANGED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_MEMBER_ADDED: 'PROJECT_MEMBER_ADDED',

  // Collaboration (FR-NOTIFY-005, FR-NOTIFY-006)
  COMMENT_ADDED: 'COMMENT_ADDED',
  MENTIONED_IN_COMMENT: 'MENTIONED_IN_COMMENT',

  // Account / Organisation
  INVITATION_RECEIVED: 'INVITATION_RECEIVED',
  ROLE_CHANGED: 'ROLE_CHANGED',
  ACCOUNT_ACTIVATED: 'ACCOUNT_ACTIVATED',
});

/**
 * Higher-urgency notification types (FR-NOTIFY-008).
 * These are presented to the user with elevated emphasis.
 */
const HIGH_URGENCY_NOTIFICATION_TYPES = Object.freeze([
  NOTIFICATION_TYPE.TASK_ASSIGNED,
  NOTIFICATION_TYPE.TASK_REASSIGNED,
  NOTIFICATION_TYPE.MENTIONED_IN_COMMENT,
  NOTIFICATION_TYPE.INVITATION_RECEIVED,
  NOTIFICATION_TYPE.ROLE_CHANGED,
]);

module.exports = { NOTIFICATION_TYPE, HIGH_URGENCY_NOTIFICATION_TYPES };
