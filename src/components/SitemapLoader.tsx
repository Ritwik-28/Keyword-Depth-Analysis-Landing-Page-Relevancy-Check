
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SitemapData, SitemapUrl } from '@/types';
import { mockFetchSitemap } from '@/utils/api';
import { Globe } from 'lucide-react';

interface SitemapLoaderProps {
  onSitemapLoaded: (urls: SitemapUrl[]) => void;
}

const SitemapLoader: React.FC<SitemapLoaderProps> = ({ onSitemapLoaded }) => {
  const [sitemapUrl, setSitemapUrl] = useState('https://example.com/sitemap.xml');
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
      // In production, use the real API: fetchSitemap(sitemapUrl)
      const response = await mockFetchSitemap(sitemapUrl);

      if (response.success && response.data) {
        setSitemapData({
          urls: response.data,
          isLoading: false,
          error: null,
        });
        onSitemapLoaded(response.data);
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
