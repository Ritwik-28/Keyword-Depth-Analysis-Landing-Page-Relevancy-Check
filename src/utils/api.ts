
import { ApiResponse, SitemapUrl, KeywordAnalysis } from '@/types';

// Base URL for API calls - update this to your deployed API URL
const API_BASE_URL = '/api';

// Helper function for making API requests
async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'An unknown error occurred',
      };
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

// Fetch sitemap from a URL
export async function fetchSitemap(sitemapUrl: string): Promise<ApiResponse<SitemapUrl[]>> {
  return fetchApi<SitemapUrl[]>('/sitemap', {
    method: 'POST',
    body: JSON.stringify({ url: sitemapUrl }),
  });
}

// Analyze keywords on a page
export async function analyzeKeywords(
  pageUrl: string, 
  keywords: string[]
): Promise<ApiResponse<KeywordAnalysis[]>> {
  return fetchApi<KeywordAnalysis[]>('/analyze', {
    method: 'POST',
    body: JSON.stringify({ 
      url: pageUrl, 
      keywords 
    }),
  });
}

// This is a mock function for local development - remove this in production
export async function mockAnalyzeKeywords(
  pageUrl: string, 
  keywords: string[]
): Promise<ApiResponse<KeywordAnalysis[]>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Create mock results
  const results: KeywordAnalysis[] = keywords.map(keyword => ({
    keyword,
    desktopDepth: Math.floor(Math.random() * 100),
    mobileDepth: Math.floor(Math.random() * 100),
    desktopScreenshot: 'https://via.placeholder.com/640x360?text=Desktop+Screenshot',
    mobileScreenshot: 'https://via.placeholder.com/360x640?text=Mobile+Screenshot',
  }));
  
  return {
    success: true,
    data: results,
  };
}

// Mock sitemap fetching for development
export async function mockFetchSitemap(sitemapUrl: string): Promise<ApiResponse<SitemapUrl[]>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create mock sitemap URLs
  const urls: SitemapUrl[] = [
    { url: 'https://example.com/', priority: '1.0' },
    { url: 'https://example.com/about', priority: '0.8' },
    { url: 'https://example.com/products', priority: '0.9' },
    { url: 'https://example.com/products/item1', priority: '0.7' },
    { url: 'https://example.com/products/item2', priority: '0.7' },
    { url: 'https://example.com/blog', priority: '0.8' },
    { url: 'https://example.com/blog/post1', priority: '0.6' },
    { url: 'https://example.com/blog/post2', priority: '0.6' },
    { url: 'https://example.com/contact', priority: '0.8' },
  ];
  
  return {
    success: true,
    data: urls,
  };
}
