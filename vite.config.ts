import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy for sitemap, URL is now configurable via VITE_SITEMAP_URL env variable
      // If VITE_SITEMAP_URL starts with /api/, treat as proxy endpoint (no rewrite/target needed)
      ...(process.env.VITE_SITEMAP_URL && process.env.VITE_SITEMAP_URL.startsWith('/api/')
        ? {} // No proxy needed for internal API
        : {
            '/api/sitemap-proxy': (() => {
              const sitemapUrl = process.env.VITE_SITEMAP_URL || 'https://www.crio.do/sitemap-pages.xml';
              let target = 'https://www.crio.do';
              let sitemapPath = '/sitemap-pages.xml';
              try {
                const u = new URL(sitemapUrl);
                target = u.origin;
                sitemapPath = u.pathname + u.search;
              } catch (e) {
                // fallback to defaults
              }
              return {
                target,
                changeOrigin: true,
                rewrite: (path) => sitemapPath,
              };
            })(),
          }),
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
