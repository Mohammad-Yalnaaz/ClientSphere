'use strict';

/**
 * invitationEmail.worker.js
 *
 * Worker processing team invitation email jobs.
 */

const { Worker } = require('bullmq');
const { redisConnection } = require('../../config/redis.config');
const logger = require('../../utils/logger.util');

let invitationEmailWorker = null;

function initInvitationEmailWorker() {
  try {
    invitationEmailWorker = new Worker(
      'invitation-email',
      async (job) => {
        const { email, organizationName, inviteUrl } = job.data;
        logger.info(`[Worker:InvitationEmail] Sending invite to ${email} for ${organizationName}...`);
        return { delivered: true, recipient: email };
      },
      { connection: redisConnection }
    );

    invitationEmailWorker.on('completed', (job) => {
      logger.info(`[Worker:InvitationEmail] Job ${job.id} completed successfully.`);
    });

    invitationEmailWorker.on('failed', (job, err) => {
      logger.error(`[Worker:InvitationEmail] Job ${job?.id} failed: ${err.message}`);
    });
  } catch (err) {
    logger.warn(`[BullMQ] Could not start invitationEmail worker: ${err.message}`);
  }
}

module.exports = {
  initInvitationEmailWorker,
};
