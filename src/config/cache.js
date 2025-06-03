const NodeCache = require('node-cache');
const redis = require('redis');
const logger = require('../utils/logger');

let cache;

if (process.env.USE_REDIS === 'true') {
  // Redis implementation
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  client.on('error', (err) => logger.error('Redis Client Error', err));
  client.connect();

  cache = {
    get: async (key) => {
      try {
        const value = await client.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        logger.error('Redis get error:', error);
        return null;
      }
    },
    set: async (key, value, ttl = process.env.CACHE_TTL_SECONDS || 300) => {
      try {
        await client.setEx(key, ttl, JSON.stringify(value));
        return true;
      } catch (error) {
        logger.error('Redis set error:', error);
        return false;
      }
    },
    del: async (key) => {
      try {
        await client.del(key);
        return true;
      } catch (error) {
        logger.error('Redis del error:', error);
        return false;
      }
    },
    flush: async () => {
      try {
        await client.flushAll();
        return true;
      } catch (error) {
        logger.error('Redis flush error:', error);
        return false;
      }
    },
  };
} else {
  // Node-cache implementation
  const nodeCache = new NodeCache({
    stdTTL: process.env.CACHE_TTL_SECONDS || 300,
    checkperiod: process.env.CACHE_CHECK_PERIOD || 60,
  });

  cache = {
    get: async (key) => nodeCache.get(key),
    set: async (key, value, ttl) => nodeCache.set(key, value, ttl),
    del: async (key) => nodeCache.del(key),
    flush: async () => nodeCache.flushAll(),
  };
}

module.exports = cache;
