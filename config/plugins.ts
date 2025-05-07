module.exports = ({ env }) => ({
    // ...
    seo: {
      enabled: true,
    },
    // config/plugins.{js,ts}
'strapi-cache': {
  enabled: true,
  config: {
    debug: false, // Enable debug logs
    max: 1000, // Maximum number of items in the cache (only for memory cache)
    ttl: 1000 * 60 * 60, // Time to live for cache items (1 hour)
    size: 1024 * 1024 * 200, // Maximum size of the cache (1 GB) (only for memory cache)
    allowStale: false, // Allow stale cache items (only for memory cache)
    cacheableRoutes: ['/api/blogs', '/api/web-medias'], // Caches routes which start with these paths (if empty array, all '/api' routes are cached)
    provider: 'memory', // Cache provider ('memory' or 'redis')
    redisUrl: env('REDIS_URL', 'redis://localhost:6379'), // Redis URL (if using Redis)
  },
},
    // ...
  });