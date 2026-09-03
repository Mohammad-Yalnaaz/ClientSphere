'use strict';

/**
 * jobs/index.js
 *
 * Background jobs manager (BullMQ).
 * Initializes all email workers and exports queue producers.
 */

const logger = require('../utils/logger.util');
const { welcomeEmailQueue, addWelcomeEmailJob } = require('./queues/welcomeEmail.queue');
const { invitationEmailQueue, addInvitationEmailJob } = require('./queues/invitationEmail.queue');
const { passwordResetEmailQueue, addPasswordResetEmailJob } = require('./queues/passwordResetEmail.queue');

const { initWelcomeEmailWorker } = require('./workers/welcomeEmail.worker');
const { initInvitationEmailWorker } = require('./workers/invitationEmail.worker');
const { initPasswordResetEmailWorker } = require('./workers/passwordResetEmail.worker');

function initBackgroundWorkers() {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  // Gracefully initialize workers if Redis is configured
  try {
    initWelcomeEmailWorker();
    initInvitationEmailWorker();
    initPasswordResetEmailWorker();
    logger.info('[Jobs] BullMQ email background workers initialized.');
  } catch (err) {
    logger.warn(`[Jobs] Failed to initialize background workers: ${err.message}`);
  }
}

module.exports = {
  initBackgroundWorkers,
  addWelcomeEmailJob,
  addInvitationEmailJob,
  addPasswordResetEmailJob,
  welcomeEmailQueue,
  invitationEmailQueue,
  passwordResetEmailQueue,
};
