'use strict';

/**
 * welcomeEmail.queue.js
 *
 * BullMQ queue for dispatching welcome emails to newly registered users.
 */

const { Queue } = require('bullmq');
const { redisConnection } = require('../../config/redis.config');
const logger = require('../../utils/logger.util');

let welcomeEmailQueue = null;

function getQueue() {
  if (!welcomeEmailQueue) {
    try {
      welcomeEmailQueue = new Queue('welcome-email', {
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
      welcomeEmailQueue.on('error', (err) => {
        // Suppress background connection errors if local Redis is absent
      });
    } catch (err) {
      logger.warn(`[BullMQ] Could not initialize welcomeEmail queue: ${err.message}`);
    }
  }
  return welcomeEmailQueue;
}

async function addWelcomeEmailJob(data) {
  const q = getQueue();
  if (!q) return null;
  try {
    return await q.add('send-welcome', data);
  } catch (err) {
    logger.warn(`[BullMQ] Failed to enqueue welcome email: ${err.message}`);
    return null;
  }
}

module.exports = {
  welcomeEmailQueue,
  addWelcomeEmailJob,
};
