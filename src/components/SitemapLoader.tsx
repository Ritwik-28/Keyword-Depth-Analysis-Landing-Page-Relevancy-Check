
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SitemapData, SitemapUrl } from '@/types';
import { fetchSitemap } from '@/utils/api';
import { Globe } from 'lucide-react';

interface SitemapLoaderProps {
  onSitemapLoaded: (urls: SitemapUrl[]) => void;
}

const SitemapLoader: React.FC<SitemapLoaderProps> = ({ onSitemapLoaded }) => {
  const [sitemapUrl, setSitemapUrl] = useState(import.meta.env.VITE_SITEMAP_URL || '');
  const [sitemapData, setSitemapData] = useState<SitemapData>({
    urls: [],
    isLoading: false,
    error: null,
  });

  const handleFetchSitemap = async () => {
    if (!sitemapUrl) {
      setSitemapData({
        ...sitemapData,
        error: 'Please enter a sitemap URL',
      });
      return;
    }

    setSitemapData({
      ...sitemapData,
      isLoading: true,
      error: null,
    });

    try {
      // Use the real API to fetch and parse the sitemap XML
      const response = await fetchSitemap(sitemapUrl);

      if (response.success && response.data) {
        // Always perform BFS ordering, but if the URLs are already flat, this keeps the same order
        let bfsUrls = [];
        const seen = new Set();
        const queue = [...response.data];
        while (queue.length > 0) {
          const node = queue.shift();
          if (!node || seen.has(node.url)) continue;
          bfsUrls.push(node);
          seen.add(node.url);
          // If node.children exists, add them to the queue (for nested sitemaps)
          if (Array.isArray(node.children)) {
            queue.push(...node.children);
          }
        }
        // If no children property, bfsUrls will just be the original array order
        if (bfsUrls.length === 0) bfsUrls = response.data;
        setSitemapData({
          urls: bfsUrls,
          isLoading: false,
          error: null,
        });
        onSitemapLoaded(bfsUrls);
      } else {
        setSitemapData({
          ...sitemapData,
          isLoading: false,
          error: response.error || 'Failed to fetch sitemap',
        });
      }
    } catch (error) {
      setSitemapData({
        ...sitemapData,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={sitemapUrl}
          onChange={(e) => setSitemapUrl(e.target.value)}
          placeholder="Enter sitemap URL"
          className="flex-1"
        />
        <Button 
          onClick={handleFetchSitemap} 
          disabled={sitemapData.isLoading}
          className="bg-blue-700 hover:bg-blue-800"
        >
          {sitemapData.isLoading ? 'Loading...' : 'Load Sitemap'}
        </Button>
      </div>

      {sitemapData.error && (
        <Alert variant="destructive">
          <AlertDescription>{sitemapData.error}</AlertDescription>
        </Alert>
      )}

      {sitemapData.urls.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-md border">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={16} className="text-blue-600" />
            <h3 className="font-medium">Sitemap Loaded: {sitemapData.urls.length} URLs found</h3>
          </div>
          <div className="text-sm text-gray-500">
            Select a URL from the dropdown below to begin analysis
          </div>
        </div>
      )}
    </div>
  );
};

export default SitemapLoader;
