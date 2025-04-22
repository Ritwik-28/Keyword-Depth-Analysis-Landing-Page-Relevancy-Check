
import { SitemapUrl } from '@/types';

/**
 * Parse XML sitemap content to extract URLs
 */
export function parseXml(xmlContent: string): SitemapUrl[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  const urls: SitemapUrl[] = [];
  
  // Handle potential parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    console.error('XML parsing error:', parserError.textContent);
    throw new Error('Invalid XML format');
  }
  
  // Find all URL elements in the sitemap
  const urlElements = xmlDoc.querySelectorAll('url');
  
  urlElements.forEach(urlElement => {
    const locElement = urlElement.querySelector('loc');
    const priorityElement = urlElement.querySelector('priority');
    const lastmodElement = urlElement.querySelector('lastmod');
    const changefreqElement = urlElement.querySelector('changefreq');
    
    if (locElement && locElement.textContent) {
      const sitemapUrl: SitemapUrl = {
        url: locElement.textContent,
      };
      
      if (priorityElement && priorityElement.textContent) {
        sitemapUrl.priority = priorityElement.textContent;
      }
      
      if (lastmodElement && lastmodElement.textContent) {
        sitemapUrl.lastmod = lastmodElement.textContent;
      }
      
      if (changefreqElement && changefreqElement.textContent) {
        sitemapUrl.changefreq = changefreqElement.textContent;
      }
      
      urls.push(sitemapUrl);
    }
  });
  
  return urls;
}
