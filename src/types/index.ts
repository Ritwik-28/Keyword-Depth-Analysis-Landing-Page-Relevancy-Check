
// Type for a single URL from the sitemap
export interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

// Type for the sitemap data
export interface SitemapData {
  urls: SitemapUrl[];
  isLoading: boolean;
  error: string | null;
}

// Type for keyword analysis results
export interface KeywordAnalysis {
  keyword: string;
  desktopDepth: number;
  mobileDepth: number;
  desktopScreenshot: string;
  mobileScreenshot: string;
}

// Type for the analysis state
export interface AnalysisState {
  isAnalyzing: boolean;
  results: KeywordAnalysis[];
  error: string | null;
}

// Type for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
