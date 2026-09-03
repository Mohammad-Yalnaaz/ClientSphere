'use strict';

/**
 * welcomeEmail.worker.js
 *
 * Worker processing welcome email jobs.
 */

const { Worker } = require('bullmq');
const { redisConnection } = require('../../config/redis.config');
const logger = require('../../utils/logger.util');

let welcomeEmailWorker = null;

function initWelcomeEmailWorker() {
  try {
    welcomeEmailWorker = new Worker(
      'welcome-email',
      async (job) => {
        const { email, firstName } = job.data;
        logger.info(`[Worker:WelcomeEmail] Sending welcome email to ${email} (${firstName})...`);
        // In real deployment, connects to nodemailer / SendGrid / SES
        return { delivered: true, recipient: email };
      },
      { connection: redisConnection }
    );

    welcomeEmailWorker.on('completed', (job) => {
      logger.info(`[Worker:WelcomeEmail] Job ${job.id} completed successfully.`);
    });

    welcomeEmailWorker.on('failed', (job, err) => {
      logger.error(`[Worker:WelcomeEmail] Job ${job?.id} failed: ${err.message}`);
    });
  } catch (err) {
    logger.warn(`[BullMQ] Could not start welcomeEmail worker: ${err.message}`);
  }
}

module.exports = {
  initWelcomeEmailWorker,
};
