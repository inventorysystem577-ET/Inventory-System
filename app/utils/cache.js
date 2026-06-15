// Simple in-memory cache with TTL (Time To Live)
const cache = new Map();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const createCacheKey = (...parts) => parts.join(":");

export const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
};

export const setCache = (key, data, ttl = DEFAULT_TTL) => {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });
};

export const clearCache = (pattern = null) => {
  if (!pattern) {
    cache.clear();
    return;
  }

  // Clear entries matching pattern
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

export const useCache = (key, asyncFn, ttl = DEFAULT_TTL) => {
  return async () => {
    const cached = getCached(key);
    if (cached !== null) {
      return cached;
    }

    const data = await asyncFn();
    setCache(key, data, ttl);
    return data;
  };
};
