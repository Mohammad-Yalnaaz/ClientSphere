'use strict';

/**
 * queueNames.constants.js
 *
 * Defines the BullMQ queue names used by the background jobs layer
 * described in SRS Chapter 2 (Section 2.9).
 *
 * Centralising queue names here prevents typos and ensures that
 * producer (jobs/queues/) and consumer (jobs/workers/) code always
 * refer to the same string identifiers.
 *
 * Frozen to prevent accidental mutation at runtime.
 */

const QUEUE_NAMES = Object.freeze({
  /**
   * Handles all outbound transactional email dispatch via Nodemailer.
   * Events: Welcome email, Password Reset, Organisation Invitation.
   * (SRS §2.9, ARCHITECTURE_DECISIONS.md §7)
   */
  EMAIL: 'email',

  /**
   * Handles asynchronous in-app notification persistence and
   * real-time delivery via Socket.io.
   */
  NOTIFICATIONS: 'notifications',

  /**
   * Handles permanent deletion of Cloudinary assets after a
   * File Metadata record is removed (FR-FILE-010).
   * Decoupled from the request lifecycle to avoid blocking the API.
   */
  FILE_CLEANUP: 'file-cleanup',
});

/**
 * Job type names within each queue.
 * Used as the `name` argument to queue.add() so that workers can
 * use queue.process(JOB_TYPES.EMAIL.SEND_WELCOME, handler) etc.
 */
const JOB_TYPES = Object.freeze({
  EMAIL: Object.freeze({
    SEND_WELCOME: 'send-welcome',
    SEND_PASSWORD_RESET: 'send-password-reset',
    SEND_INVITATION: 'send-invitation',
  }),
  NOTIFICATIONS: Object.freeze({
    PERSIST_AND_EMIT: 'persist-and-emit',
  }),
  FILE_CLEANUP: Object.freeze({
    DELETE_CLOUDINARY_ASSET: 'delete-cloudinary-asset',
  }),
});

module.exports = { QUEUE_NAMES, JOB_TYPES };
