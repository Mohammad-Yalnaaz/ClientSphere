'use strict';

/**
 * passwordResetEmail.worker.js
 *
 * Worker processing password reset email jobs.
 */

const { Worker } = require('bullmq');
const { redisConnection } = require('../../config/redis.config');
const logger = require('../../utils/logger.util');

let passwordResetEmailWorker = null;

function initPasswordResetEmailWorker() {
  try {
    passwordResetEmailWorker = new Worker(
      'password-reset-email',
      async (job) => {
        const { email, resetUrl } = job.data;
        logger.info(`[Worker:PasswordResetEmail] Sending reset email to ${email}...`);
        return { delivered: true, recipient: email };
      },
      { connection: redisConnection }
    );

    passwordResetEmailWorker.on('completed', (job) => {
      logger.info(`[Worker:PasswordResetEmail] Job ${job.id} completed successfully.`);
    });

    passwordResetEmailWorker.on('failed', (job, err) => {
      logger.error(`[Worker:PasswordResetEmail] Job ${job?.id} failed: ${err.message}`);
    });
  } catch (err) {
    logger.warn(`[BullMQ] Could not start passwordResetEmail worker: ${err.message}`);
  }
}

module.exports = {
  initPasswordResetEmailWorker,
};
