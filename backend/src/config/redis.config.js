'use strict';

/**
 * redis.config.js
 *
 * Redis connection configuration for BullMQ job queues.
 * In development, provides graceful degradation if Redis is offline.
 */

const Redis = require('ioredis');
const logger = require('../utils/logger.util');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

module.exports = {
  redisUrl,
  redisConnection,
};
