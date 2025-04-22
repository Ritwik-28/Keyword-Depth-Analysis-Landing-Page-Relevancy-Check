// Redis client using Upstash (recommended for Vercel/serverless)
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: import.meta.env.VITE_REDIS_URL || process.env.VITE_REDIS_URL,
  token: import.meta.env.VITE_REDIS_API_KEY || process.env.VITE_REDIS_API_KEY,
});
