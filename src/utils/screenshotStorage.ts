
import { supabase } from '@/integrations/supabase/client';
import { convertToWebP } from './imageConverter';

export async function uploadScreenshot(
  imageBuffer: Buffer, 
  pageUrl: string, 
  keyword: string, 
  type: 'desktop' | 'mobile'
): Promise<string> {
  // Convert image to WebP
  const webpBuffer = await convertToWebP(imageBuffer);

  // Generate a unique filename
  const filename = `${pageUrl.replace(/[^a-zA-Z0-9]/g, '_')}_${keyword}_${type}_${Date.now()}.webp`;

  // Upload to Supabase storage
  const { data, error } = await supabase.storage
    .from('screenshots')
    .upload(filename, webpBuffer, {
      contentType: 'image/webp',
      upsert: true
    });

  if (error) {
    console.error('Error uploading screenshot:', error);
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('screenshots')
    .getPublicUrl(filename);

  return publicUrl;
}

export async function saveKeywordAnalysis(
  pageUrl: string, 
  keyword: string, 
  desktopDepth: number, 
  mobileDepth: number,
  desktopScreenshotUrl: string, 
  mobileScreenshotUrl: string
) {
  const { data, error } = await supabase
    .from('keyword_analysis')
    .upsert({
      page_url: pageUrl,
      keyword: keyword,
      desktop_depth: desktopDepth,
      mobile_depth: mobileDepth,
      desktop_screenshot: desktopScreenshotUrl,
      mobile_screenshot: mobileScreenshotUrl
    })
    .select();

  if (error) {
    console.error('Error saving keyword analysis:', error);
    throw error;
  }

  return data;
}
