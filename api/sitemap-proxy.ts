import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { redis } from '../src/utils/redisClient';

const SITEMAP_URL = 'https://www.crio.do/sitemap-pages.xml';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await redis.connect(); // Ensure redis is connected before use
    const cacheKey = `sitemap-proxy:${SITEMAP_URL}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', 'application/xml');
      return res.status(200).send(cached);
    }

    const response = await fetch(SITEMAP_URL);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch sitemap: ${response.statusText}` });
    }
    const xml = await response.text();
    await redis.set(cacheKey, xml, { ex: 600 }); // 10 min TTL
    res.setHeader('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || String(error) });
  }
}
