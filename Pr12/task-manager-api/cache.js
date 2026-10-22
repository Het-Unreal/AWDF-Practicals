const NodeCache = require('node-cache');

// Standard TTL of 60 seconds with background cleanup every 120 seconds
const cacheInstance = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// Supplementary Problem 2: Cache Hit/Miss Metrics Tracker
const cacheMetrics = {
    hits: 0,
    misses: 0,
    invalidations: 0,
    sets: 0,
    startTime: new Date().toISOString()
};

const cacheService = {
    /**
     * Retrieve cached value and record hit/miss metrics
     */
    get: (key) => {
        const value = cacheInstance.get(key);
        if (value !== undefined) {
            cacheMetrics.hits++;
            return { hit: true, data: value };
        } else {
            cacheMetrics.misses++;
            return { hit: false, data: null };
        }
    },

    /**
     * Store key-value with optional custom TTL
     */
    set: (key, value, ttl) => {
        cacheMetrics.sets++;
        if (ttl !== undefined) {
            return cacheInstance.set(key, value, ttl);
        }
        return cacheInstance.set(key, value);
    },

    /**
     * Delete specific key or array of keys (invalidation)
     */
    del: (keys) => {
        const count = cacheInstance.del(keys);
        cacheMetrics.invalidations += count;
        return count;
    },

    /**
     * Flush all keys
     */
    flush: () => {
        cacheMetrics.invalidations += cacheInstance.keys().length;
        return cacheInstance.flushAll();
    },

    /**
     * Retrieve debug statistics and performance ratios
     */
    getStats: () => {
        const totalRequests = cacheMetrics.hits + cacheMetrics.misses;
        const hitRatio = totalRequests > 0 
            ? ((cacheMetrics.hits / totalRequests) * 100).toFixed(2) + '%' 
            : '0.00%';

        return {
            ...cacheMetrics,
            totalRequests,
            hitRatio,
            activeKeys: cacheInstance.keys(),
            activeKeysCount: cacheInstance.keys().length,
            nodeCacheInternalStats: cacheInstance.getStats()
        };
    },

    raw: cacheInstance
};

module.exports = cacheService;
