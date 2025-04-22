# Page Depth Explorer

## Overview

**Page Depth Explorer** is a robust web application designed for SEO professionals, performance marketing specialist, and content strategists to analyze how visible and accessible specific keywords are across large websites. By leveraging automated sitemap parsing, keyword search, and scroll-depth screenshotting, this tool helps you understand exactly where (and how deeply) your critical keywords appear on your site—across both desktop and mobile experiences.

---

## Project Goals

- **Automate the analysis of keyword placement** across all pages of a website, using the site's sitemap as the source of truth.
- **Quantify the scroll depth** at which a keyword first appears, providing actionable insights for both SEO and user experience improvements.
- **Support both desktop and mobile views** for a realistic understanding of content accessibility on different devices.
- **Provide annotated screenshots** with highlighted keywords, making it easy to visualize results.
- **Enable fast, scalable analysis** for large sites using caching and modern backend infrastructure.

---

## Why Is This Important?

- **SEO Impact:** Search engines may not index content that is buried deep within a page. By understanding keyword depth, you can optimize your content structure for better rankings.
- **User Experience:** Users are unlikely to scroll through long pages. Ensuring that critical information appears higher up increases engagement and conversions.
- **Mobile-First Web:** Content layout and depth can vary dramatically between desktop and mobile. This tool exposes those differences, helping you optimize for all users.
- **Scalability:** Manual keyword depth analysis is impractical for large sites. Automation and caching make this process fast and repeatable.

---

## Key Features

- **Sitemap Loader:** Automatically loads and parses your website’s sitemap, supporting both direct and proxied fetches to handle CORS and large sitemaps.
- **Intelligent Dropdown Search:** Quickly filter and select URLs from large sitemaps using a breadth-first search (BFS) algorithm that prioritizes relevance.
- **Keyword Analysis:** Analyze one or more keywords per page, reporting the scroll depth and providing highlighted screenshots for both desktop and mobile layouts.
- **Screenshot API:** Utilizes Puppeteer (with AWS Lambda/Vercel compatibility) to capture and annotate screenshots with highlighted keywords.
- **Caching:** Integrates Upstash Redis to cache sitemap data and keyword analysis results for improved speed and reduced redundant API calls.
- **Supabase Integration:** Optionally stores historical keyword analysis results for later review or export.

---

## Architecture & Technology

- **Frontend:** React, Vite, TypeScript for a fast and modern UI.
- **Backend API:** Vercel serverless functions (Node.js, TypeScript) for scalable, serverless API endpoints.
- **Screenshot Service:** Puppeteer/Chrome AWS Lambda for headless browser automation and screenshotting.
- **Caching:** Upstash Redis for fast, serverless-compatible caching.
- **Database (optional):** Supabase (Postgres) for persistent storage of analysis results.

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/page-depth-explorer.git
cd page-depth-explorer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```
- `SITEMAP_TARGET_URL`: The actual sitemap XML URL (e.g., `https://www.example.com/sitemap.xml`)
- `VITE_SITEMAP_URL`: Usually `/api/sitemap-proxy` for local/prod, or the remote URL for direct fetch
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`: Your Supabase project credentials
- `VITE_REDIS_URL` and `VITE_REDIS_API_KEY`: Your Upstash Redis credentials

### 4. Start the Development Server
For local development with Vercel serverless API emulation:
```bash
vercel dev
```
Or, for pure Vite frontend (API routes will not work):
```bash
npm run dev
```

---

## Usage Guide

1. **Load Sitemap:** The app will automatically fetch and parse your sitemap.
2. **Select a Page:** Use the dropdown search to find and select a URL from your sitemap.
3. **Enter Keywords:** Type one or more keywords (comma-separated).
4. **Analyze:** Click “Analyze Keywords.” The app will:
   - Call the screenshot API for both desktop and mobile views
   - Highlight the first occurrence of each keyword
   - Report the scroll depth as a percentage of the page height
   - Display annotated screenshots for both device types
5. **Review History:** If Supabase is enabled, you can view or export previous analyses.

---

## Advanced Features

- **Sitemap Proxy API:** `/api/sitemap-proxy` backend route fetches and caches the sitemap, solving CORS and performance issues.
- **Screenshot API:** `/api/screenshot` backend route works on both local and Vercel deployments, using Puppeteer/Chrome AWS Lambda.
- **Redis Caching:** Both sitemap and keyword analysis results are cached for 10 minutes by default, dramatically speeding up repeated queries.
- **Supabase Integration:** (Optional) Store and retrieve historical keyword analysis results for deeper reporting and export.

---

## Troubleshooting

- **Sitemap Fails to Load:** Ensure your `.env` is configured correctly and the sitemap URL is reachable from your backend.
- **API 404 or 500 Errors:** Make sure you are running with `vercel dev` and all dependencies are installed.
- **Redis/Supabase Errors:** Double-check your credentials in `.env` and that the services are reachable.
- **NPM Install Issues:** If you see errors, try deleting `node_modules` and `package-lock.json`, then reinstall dependencies.

---

## Contributing

Contributions are welcome! Please open an issue to discuss major changes before submitting a pull request.

---

## License

MIT

- **Frontend**: React + Vite + TypeScript
- **Backend API**: Vercel serverless functions (Node.js, TypeScript)
- **Screenshot Service**: Puppeteer/Chrome AWS Lambda for scalable screenshotting
- **Caching**: Upstash Redis (serverless-compatible)
- **Database (optional)**: Supabase (Postgres)

---