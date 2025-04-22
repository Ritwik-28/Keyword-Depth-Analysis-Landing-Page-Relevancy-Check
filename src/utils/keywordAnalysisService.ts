import { supabase } from '@/integrations/supabase/client';
import { KeywordAnalysis } from '@/types';
import { uploadScreenshot, saveKeywordAnalysis } from './screenshotStorage';
import { Redis } from '@upstash/redis';

// Always initialize redis at the top so it's available everywhere
export const redis = new Redis({
  url: process.env.VITE_REDIS_URL!,
  token: process.env.VITE_REDIS_API_KEY!,
});

// Calculate depth percentage based on element position
function calculateDepthPercentage(element: Element, deviceType: 'desktop' | 'mobile'): number {
  const rect = element.getBoundingClientRect();
  const elementTop = rect.top + window.scrollY;
  
  // Total document height (visible part)
  const documentHeight = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  );
  
  // Calculate what percentage down the page this element appears
  const depthPercentage = Math.round((elementTop / documentHeight) * 100);
  console.log(`[${deviceType}] Keyword found at pixel depth: ${elementTop}px, page height: ${documentHeight}px, percentage: ${depthPercentage}%`);
  
  return Math.min(Math.max(depthPercentage, 0), 100); // Clamp between 0-100
}

// Find the first occurrence of a keyword on the page
// Verbose logging for scroll depth and keyword detection
function findKeywordOnPage(keyword: string, deviceType: 'desktop' | 'mobile'): {
  element: Element | null;
  depth: number;
} {
  console.log(`Searching for keyword: "${keyword}" on ${deviceType}`);
  
  // Get all text nodes in the document
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let node;
  let elements: Element[] = [];
  let textContents: string[] = [];
  
  // Collect all text nodes
  let nodeIndex = 0;
  while ((node = walker.nextNode())) {
    const element = node.parentElement;
    const text = node.textContent?.toLowerCase() || '';
    
    // Skip hidden elements
    if (element && window.getComputedStyle(element).display !== 'none' && 
        window.getComputedStyle(element).visibility !== 'hidden') {
      elements.push(element);
      textContents.push(text);
      console.log(`[${deviceType}] Text node[${nodeIndex}]:`, text.slice(0, 100));
      nodeIndex++;
    }
  }
  
  // Find the first occurrence of the keyword
  for (let i = 0; i < textContents.length; i++) {
    if (textContents[i].includes(keyword.toLowerCase())) {
      const depth = calculateDepthPercentage(elements[i], deviceType);
      console.log(`[${deviceType}] Found keyword "${keyword}" in element:`, elements[i], `at depth: ${depth}%`);
      return { element: elements[i], depth };
    }
  }
  
  console.log(`[${deviceType}] Keyword "${keyword}" not found on page`);
  return { element: null, depth: 100 }; // Return 100% if not found (bottom of page)
}

// Take a screenshot of the real page using thum.io free API
// NOTE: The screenshot is of the actual live page, not a local render. If you want to highlight the keyword in the screenshot,
// thum.io supports a 'highlight' parameter (paid plan only). For free API, we cannot highlight the keyword in the screenshot.
// See: https://www.thum.io/documentation/
async function captureScreenshotWithScrollDepth(pageUrl: string, deviceType: 'desktop' | 'mobile', keyword: string): Promise<{ screenshot: string | null; scrollDepth: number | null; error?: string }> {
  try {
    const apiUrl = `/api/screenshot?url=${encodeURIComponent(pageUrl)}&keyword=${encodeURIComponent(keyword)}&deviceType=${deviceType}`;
    const response = await fetch(apiUrl);
    let responseBody: string | null = null;
    if (!response.ok) {
      responseBody = await response.text();
      // Try to parse JSON, but if not possible, return the error as text
      try {
        const data = JSON.parse(responseBody);
        if (data.error) {
          return { screenshot: null, scrollDepth: null, error: data.error };
        }
      } catch {
        return { screenshot: null, scrollDepth: null, error: `Screenshot API error (${response.status}): ${responseBody}` };
      }
    }
    // Try to parse JSON; if not, return a clear error
    let data: any;
    try {
      responseBody = responseBody ?? await response.text();
      data = JSON.parse(responseBody);
    } catch (jsonErr) {
      return { screenshot: null, scrollDepth: null, error: `Screenshot API fetch failed: Unexpected response: ${(responseBody ?? '').slice(0, 100)}` };
    }
    if (data.error) {
      return { screenshot: null, scrollDepth: null, error: data.error };
    }
    return {
      screenshot: data.screenshot || null,
      scrollDepth: typeof data.scrollDepth === 'number' ? data.scrollDepth : null,
      error: null,
    };
  } catch (error) {
    return { screenshot: null, scrollDepth: null, error: `Screenshot API fetch failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// Analyze a keyword on the current page
export async function analyzeKeywordOnPage(
  pageUrl: string,
  keyword: string
): Promise<KeywordAnalysis> {
  // Redis cache key
  const cacheKey = `ka:${pageUrl}:${keyword}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached as string);

  console.log(`Analyzing keyword "${keyword}" on page ${pageUrl}`);

  // Screenshot and scroll depth
  let desktopScreenshot = '';
  let mobileScreenshot = '';
  let desktopScreenshotError = '';
  let mobileScreenshotError = '';
  let desktopScrollDepth: number | null = null;
  let mobileScrollDepth: number | null = null;

  // Fetch screenshot and scroll depth via API
  const desktopShot = await captureScreenshotWithScrollDepth(pageUrl, 'desktop', keyword);
  if (desktopShot.screenshot) desktopScreenshot = desktopShot.screenshot;
  if (desktopShot.error) desktopScreenshotError = desktopShot.error;
  if (typeof desktopShot.scrollDepth === 'number') desktopScrollDepth = desktopShot.scrollDepth;

  const mobileShot = await captureScreenshotWithScrollDepth(pageUrl, 'mobile', keyword);
  if (mobileShot.screenshot) mobileScreenshot = mobileShot.screenshot;
  if (mobileShot.error) mobileScreenshotError = mobileShot.error;
  if (typeof mobileShot.scrollDepth === 'number') mobileScrollDepth = mobileShot.scrollDepth;

  // Use scrollDepth from API for both desktopDepth and mobileDepth
  const desktopDepth = typeof desktopScrollDepth === 'number' ? desktopScrollDepth : 100;
  const mobileDepth = typeof mobileScrollDepth === 'number' ? mobileScrollDepth : 100;

  // Optionally, save analysis to DB here (not included)
  const result = {
    pageUrl,
    keyword,
    desktopDepth,
    mobileDepth,
    desktopScreenshot,
    mobileScreenshot,
    screenshotErrors: {
      desktop: desktopScreenshotError,
      mobile: mobileScreenshotError
    },
    desktopScrollDepth,
    mobileScrollDepth
  };
  await redis.set(cacheKey, JSON.stringify(result), { ex: 600 });
  return result;
}

// Fetch all keyword analysis results
export async function fetchKeywordAnalysisResults(): Promise<KeywordAnalysis[]> {
  const { data, error } = await supabase
    .from('keyword_analysis')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching keyword analysis results:', error);
    throw error;
  }
  
  // Map database results to the KeywordAnalysis type
  return data.map(item => ({
    pageUrl: item.page_url,
    keyword: item.keyword,
    desktopDepth: item.desktop_depth,
    mobileDepth: item.mobile_depth,
    desktopScreenshot: item.desktop_screenshot,
    mobileScreenshot: item.mobile_screenshot
  }));
}
