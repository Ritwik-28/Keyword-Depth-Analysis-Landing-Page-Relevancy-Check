
import { supabase } from '@/integrations/supabase/client';

// Accepts a WebP Blob from the browser and uploads it directly
export async function uploadScreenshot(
  imageBlob: Blob, 
  pageUrl: string, 
  keyword: string, 
  type: 'desktop' | 'mobile'
): Promise<string> {
  try {
    console.log(`Uploading ${type} screenshot for "${keyword}" on ${pageUrl}...`);
    
    // Generate a unique filename
    const filename = `${pageUrl.replace(/[^a-zA-Z0-9]/g, '_')}_${keyword}_${type}_${Date.now()}.webp`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('screenshots')
      .upload(filename, imageBlob, {
        contentType: 'image/webp',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading screenshot:', error);
      throw error;
    }
    
    console.log(`Screenshot uploaded successfully: ${filename}`);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('screenshots')
      .getPublicUrl(filename);
    
    return publicUrl;
  } catch (error) {
    console.error(`Error in uploadScreenshot (${type}):`, error);
    throw error;
  }
}

export async function saveKeywordAnalysis(
  pageUrl: string, 
  keyword: string, 
  desktopDepth: number, 
  mobileDepth: number,
  desktopScreenshotUrl: string, 
  mobileScreenshotUrl: string
) {
  try {
    console.log(`Saving analysis for "${keyword}" on ${pageUrl}...`);
    
    const { data, error } = await supabase
      .from('keyword_analysis')
      .upsert({
        page_url: pageUrl,
        keyword: keyword,
        desktop_depth: desktopDepth,
        mobile_depth: mobileDepth,
        desktop_screenshot: desktopScreenshotUrl,
        mobile_screenshot: mobileScreenshotUrl
      }, { onConflict: ['page_url', 'keyword'] })
      .select();
    
    if (error) {
      console.error('Error saving keyword analysis:', error);
      throw error;
    }
    
    console.log('Analysis saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in saveKeywordAnalysis:', error);
    throw error;
  }
}

// Function to retrieve analysis from database
export async function getKeywordAnalysis(pageUrl: string, keyword: string) {
  try {
    const { data, error } = await supabase
      .from('keyword_analysis')
      .select('*')
      .eq('page_url', pageUrl)
      .eq('keyword', keyword)
      .single();
    
    if (error) {
      console.error('Error fetching keyword analysis:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getKeywordAnalysis:', error);
    throw error;
  }
}
