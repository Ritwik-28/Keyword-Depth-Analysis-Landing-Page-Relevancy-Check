
import { supabase } from '@/integrations/supabase/client';
import { KeywordAnalysis } from '@/types';
import { uploadScreenshot, saveKeywordAnalysis } from './screenshotStorage';

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
  while ((node = walker.nextNode())) {
    const element = node.parentElement;
    const text = node.textContent?.toLowerCase() || '';
    
    // Skip hidden elements
    if (element && window.getComputedStyle(element).display !== 'none' && 
        window.getComputedStyle(element).visibility !== 'hidden') {
      elements.push(element);
      textContents.push(text);
    }
  }
  
  // Find the first occurrence of the keyword
  for (let i = 0; i < textContents.length; i++) {
    if (textContents[i].includes(keyword.toLowerCase())) {
      const depth = calculateDepthPercentage(elements[i], deviceType);
      console.log(`Found keyword "${keyword}" in element:`, elements[i], `at depth: ${depth}%`);
      return { element: elements[i], depth };
    }
  }
  
  console.log(`Keyword "${keyword}" not found on page`);
  return { element: null, depth: 100 }; // Return 100% if not found (bottom of page)
}

// Take a screenshot of the page
async function captureScreenshot(deviceType: 'desktop' | 'mobile'): Promise<Blob | null> {
  try {
    console.log(`Taking ${deviceType} screenshot`);
    
    // This would be replaced with actual screenshot capture logic
    // For a real implementation, this requires a browser extension or server-side functionality
    // Here we're just creating a placeholder for testing
    
    // In a real implementation, you'd use something like:
    // const screenshot = await browser.tabs.captureVisibleTab();
    
    // For placeholder/testing purposes:
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (deviceType === 'desktop') {
      canvas.width = 1280;
      canvas.height = 800;
    } else {
      canvas.width = 375;
      canvas.height = 667;
    }
    
    if (ctx) {
      // Draw a simple placeholder
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, 60);
      
      ctx.fillStyle = '#333333';
      ctx.font = '16px Arial';
      ctx.fillText(`${deviceType} screenshot of ${window.location.href}`, 20, 30);
      
      ctx.fillStyle = '#e0e0e0';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(20, 80 + i * 60, canvas.width - 40, 40);
      }
    }
    
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve(blob);
      }, 'image/png');
    });
  } catch (error) {
    console.error(`Error capturing ${deviceType} screenshot:`, error);
    return null;
  }
}

// Analyze a keyword on the current page
export async function analyzeKeywordOnPage(
  pageUrl: string,
  keyword: string
): Promise<KeywordAnalysis> {
  console.log(`Analyzing keyword "${keyword}" on page ${pageUrl}`);
  
  // Desktop analysis
  const desktopResult = findKeywordOnPage(keyword, 'desktop');
  const desktopDepth = desktopResult.depth;
  
  // Mobile analysis (simulated)
  // In a real implementation, you'd use a mobile viewport simulation
  const mobileResult = findKeywordOnPage(keyword, 'mobile');
  const mobileDepth = mobileResult.depth;
  
  console.log(`Analysis complete - Desktop: ${desktopDepth}%, Mobile: ${mobileDepth}%`);
  
  // Capture screenshots
  const desktopScreenshot = await captureScreenshot('desktop');
  const mobileScreenshot = await captureScreenshot('mobile');
  
  let desktopScreenshotUrl = '';
  let mobileScreenshotUrl = '';
  
  // Upload screenshots to Supabase storage
  if (desktopScreenshot) {
    const buffer = await desktopScreenshot.arrayBuffer();
    desktopScreenshotUrl = await uploadScreenshot(
      Buffer.from(buffer), 
      pageUrl, 
      keyword, 
      'desktop'
    );
    console.log('Desktop screenshot uploaded:', desktopScreenshotUrl);
  }
  
  if (mobileScreenshot) {
    const buffer = await mobileScreenshot.arrayBuffer();
    mobileScreenshotUrl = await uploadScreenshot(
      Buffer.from(buffer), 
      pageUrl, 
      keyword, 
      'mobile'
    );
    console.log('Mobile screenshot uploaded:', mobileScreenshotUrl);
  }
  
  // Save analysis results to Supabase database
  await saveKeywordAnalysis(
    pageUrl,
    keyword,
    desktopDepth,
    mobileDepth,
    desktopScreenshotUrl,
    mobileScreenshotUrl
  );
  
  return {
    keyword,
    desktopDepth,
    mobileDepth,
    desktopScreenshot: desktopScreenshotUrl,
    mobileScreenshot: mobileScreenshotUrl
  };
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
    keyword: item.keyword,
    desktopDepth: item.desktop_depth,
    mobileDepth: item.mobile_depth,
    desktopScreenshot: item.desktop_screenshot,
    mobileScreenshot: item.mobile_screenshot
  }));
}
