/**
 * Analytics Service (Bonus Feature)
 * Tracks API usage statistics per API key
 * Stores data in cache with daily granularity
 */

const cache = require('../config/cache');
const logger = require('../utils/logger');

/**
 * Analytics Service Class
 * Provides methods to track and retrieve API usage statistics
 */
class AnalyticsService {
  constructor() {
    // In-memory storage for quick access
    // This is reset on server restart
    this.requestCounts = new Map();
  }

  /**
   * Track an API request
   * @param {string} apiKey - API key making the request
   * @param {string} endpoint - Endpoint being accessed
   * @returns {Promise<void>}
   */
  async trackRequest(apiKey, endpoint) {
    try {
      // Generate date-based key for daily statistics
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const key = `analytics:${apiKey}:${date}`;
      
      // Get existing stats or create new object
      const current = await cache.get(key) || { 
        total: 0, 
        endpoints: {} 
      };
      
      // Increment counters
      current.total++;
      current.endpoints[endpoint] = (current.endpoints[endpoint] || 0) + 1;
      
      // Save updated stats to cache with 24-hour TTL
      await cache.set(key, current, 86400);
      
      // Also update in-memory storage for quick access
      const memKey = `${apiKey}:${date}`;
      if (!this.requestCounts.has(memKey)) {
        this.requestCounts.set(memKey, { total: 0, endpoints: {} });
      }
      
      const memStats = this.requestCounts.get(memKey);
      memStats.total++;
      memStats.endpoints[endpoint] = (memStats.endpoints[endpoint] || 0) + 1;
      
    } catch (error) {
      // Don't let analytics errors affect API functionality
      logger.error('Error tracking analytics:', error);
    }
  }

  /**
   * Get usage statistics for an API key
   * @param {string} apiKey - API key to get stats for
   * @param {number} days - Number of days to retrieve (default: 7)
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsageStats(apiKey, days = 7) {
    const stats = [];
    const endDate = new Date();
    
    // Collect stats for each day
    for (let i = 0; i < days; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Retrieve stats from cache
      const key = `analytics:${apiKey}:${dateStr}`;
      const dayStats = await cache.get(key) || { total: 0, endpoints: {} };
      
      stats.push({
        date: dateStr,
        ...dayStats,
      });
    }
    
    // Calculate summary statistics
    const totalRequests = stats.reduce((sum, day) => sum + day.total, 0);
    
    return {
      apiKey,
      period: `${days} days`,
      stats: stats.reverse(), // Oldest to newest
      summary: {
        totalRequests,
        averagePerDay: Math.round(totalRequests / days),
        mostUsedEndpoints: this.getMostUsedEndpoints(stats),
      },
    };
  }

  /**
   * Helper method to find most used endpoints
   * @param {Array} stats - Daily statistics array
   * @returns {Array} Top endpoints by usage
   */
  getMostUsedEndpoints(stats) {
    const endpointTotals = {};
    
    // Aggregate endpoint usage across all days
    stats.forEach(day => {
      Object.entries(day.endpoints || {}).forEach(([endpoint, count]) => {
        endpointTotals[endpoint] = (endpointTotals[endpoint] || 0) + count;
      });
    });
    
    // Sort by usage and return top 5
    return Object.entries(endpointTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([endpoint, count]) => ({ endpoint, count }));
  }
}

// Export singleton instance of AnalyticsService
module.exports = new AnalyticsService();
