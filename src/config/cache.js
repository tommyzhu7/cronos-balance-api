/**
 * Cache Configuration
 * Supports both in-memory caching (node-cache) and Redis
 * Switch between implementations using USE_REDIS environment variable
 */

const NodeCache = require('node-cache');
const redis = require('redis');
const logger = require('../utils/logger');

// Cache instance that will be exported
let cache;

/**
 * Initialize cache based on environment configuration
 */
if (process.env.USE_REDIS === 'true') {
  /**
   * Redis Cache Implementation
   * Used for distributed caching in production environments
   */
  
  // Create Redis client with connection URL
  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  // Log Redis connection errors
  client.on('error', (err) => logger.error('Redis Client Error', err));
  
  // Connect to Redis server
  client.connect();

  // Implement cache interface for Redis
  cache = {
    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {Promise<any>} Cached value or null if not found
     */
    get: async (key) => {
      try {
        const value = await client.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        logger.error('Redis get error:', error);
        return null;
      }
    },
    
    /**
     * Set value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in seconds
     * @returns {Promise<boolean>} Success status
     */
    set: async (key, value, ttl = process.env.CACHE_TTL_SECONDS || 300) => {
      try {
        await client.setEx(key, ttl, JSON.stringify(value));
        return true;
      } catch (error) {
        logger.error('Redis set error:', error);
        return false;
      }
    },
    
    /**
     * Delete key from cache
     * @param {string} key - Cache key to delete
     * @returns {Promise<boolean>} Success status
     */
    del: async (key) => {
      try {
        await client.del(key);
        return true;
      } catch (error) {
        logger.error('Redis del error:', error);
        return false;
      }
    },
    
    /**
     * Clear all cache entries
     * @returns {Promise<boolean>} Success status
     */
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
  /**
   * In-Memory Cache Implementation
   * Used for development and single-instance deployments
   */
  
  // Create node-cache instance with TTL and check period
  const nodeCache = new NodeCache({
    stdTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 300, // Default 5 minutes
    checkperiod: parseInt(process.env.CACHE_CHECK_PERIOD) || 60, // Check every 60 seconds
  });

  // Implement cache interface for node-cache
  cache = {
    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {Promise<any>} Cached value or undefined if not found
     */
    get: async (key) => nodeCache.get(key),
    
    /**
     * Set value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in seconds (optional)
     * @returns {Promise<boolean>} Success status
     */
    set: async (key, value, ttl) => nodeCache.set(key, value, ttl),
    
    /**
     * Delete key from cache
     * @param {string} key - Cache key to delete
     * @returns {Promise<number>} Number of deleted entries
     */
    del: async (key) => nodeCache.del(key),
    
    /**
     * Clear all cache entries
     * @returns {Promise<void>}
     */
    flush: async () => nodeCache.flushAll(),
  };
}

// Export the cache instance
module.exports = cache;
