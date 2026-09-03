'use strict';

/**
 * passwordResetEmail.queue.js
 *
 * BullMQ queue for dispatching password reset emails.
 */

const { Queue } = require('bullmq');
const { redisConnection } = require('../../config/redis.config');
const logger = require('../../utils/logger.util');

let passwordResetEmailQueue = null;

function getQueue() {
  if (!passwordResetEmailQueue) {
    try {
      passwordResetEmailQueue = new Queue('password-reset-email', {
        connection: redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: true,
        },
      });
      passwordResetEmailQueue.on('error', () => {});
    } catch (err) {
      logger.warn(`[BullMQ] Could not initialize passwordResetEmail queue: ${err.message}`);
    }
  }
  return passwordResetEmailQueue;
}

async function addPasswordResetEmailJob(data) {
  const q = getQueue();
  if (!q) return null;
  try {
    return await q.add('send-password-reset', data);
  } catch (err) {
    logger.warn(`[BullMQ] Failed to enqueue password reset email: ${err.message}`);
    return null;
  }
}

module.exports = {
  passwordResetEmailQueue,
  addPasswordResetEmailJob,
};
