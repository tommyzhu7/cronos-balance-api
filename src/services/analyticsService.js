const cache = require('../config/cache');
const logger = require('../utils/logger');

class AnalyticsService {
  constructor() {
    this.requestCounts = new Map();
  }

  async trackRequest(apiKey, endpoint) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const key = `analytics:${apiKey}:${date}`;
      
      // Increment request count
      const current = await cache.get(key) || { 
        total: 0, 
        endpoints: {} 
      };
      
      current.total++;
      current.endpoints[endpoint] = (current.endpoints[endpoint] || 0) + 1;
      
      await cache.set(key, current, 86400); // 24 hours
      
      // Also track in memory for quick access
      const memKey = `${apiKey}:${date}`;
      if (!this.requestCounts.has(memKey)) {
        this.requestCounts.set(memKey, { total: 0, endpoints: {} });
      }
      
      const memStats = this.requestCounts.get(memKey);
      memStats.total++;
      memStats.endpoints[endpoint] = (memStats.endpoints[endpoint] || 0) + 1;
      
    } catch (error) {
      logger.error('Error tracking analytics:', error);
    }
  }

  async getUsageStats(apiKey, days = 7) {
    const stats = [];
    const endDate = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const key = `analytics:${apiKey}:${dateStr}`;
      const dayStats = await cache.get(key) || { total: 0, endpoints: {} };
      
      stats.push({
        date: dateStr,
        ...dayStats,
      });
    }
    
    return {
      apiKey,
      period: `${days} days`,
      stats: stats.reverse(),
      summary: {
        totalRequests: stats.reduce((sum, day) => sum + day.total, 0),
        averagePerDay: Math.round(stats.reduce((sum, day) => sum + day.total, 0) / days),
      },
    };
  }
}

module.exports = new AnalyticsService();
