'use strict';

/**
 * invitationEmail.queue.js
 *
 * BullMQ queue for dispatching team member and client invitation emails.
 */

const { Queue } = require('bullmq');
const { redisConnection } = require('../../config/redis.config');
const logger = require('../../utils/logger.util');

let invitationEmailQueue = null;

function getQueue() {
  if (!invitationEmailQueue) {
    try {
      invitationEmailQueue = new Queue('invitation-email', {
        connection: redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
        },
      });
      invitationEmailQueue.on('error', () => {});
    } catch (err) {
      logger.warn(`[BullMQ] Could not initialize invitationEmail queue: ${err.message}`);
    }
  }
  return invitationEmailQueue;
}

async function addInvitationEmailJob(data) {
  const q = getQueue();
  if (!q) return null;
  try {
    return await q.add('send-invitation', data);
  } catch (err) {
    logger.warn(`[BullMQ] Failed to enqueue invitation email: ${err.message}`);
    return null;
  }
}

module.exports = {
  invitationEmailQueue,
  addInvitationEmailJob,
};
