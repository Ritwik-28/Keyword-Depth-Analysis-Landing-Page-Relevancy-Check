
import { ApiResponse, SitemapUrl, KeywordAnalysis } from '@/types';
import { parseXml } from './xmlParser';

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

// Fetch sitemap from a URL and parse XML
export async function fetchSitemap(sitemapUrl: string): Promise<ApiResponse<SitemapUrl[]>> {
  try {
    const response = await fetch(sitemapUrl);
    
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch sitemap: ${response.statusText}`,
      };
    }
    
    const xmlText = await response.text();
    const urls = parseXml(xmlText);
    
    return {
      success: true,
      data: urls,
    };
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred while fetching sitemap',
    };
  }
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
