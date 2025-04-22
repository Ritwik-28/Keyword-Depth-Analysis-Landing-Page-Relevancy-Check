
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PageSelector from '@/components/PageSelector';
import KeywordInput from '@/components/KeywordInput';
import AnalyzeButton from '@/components/AnalyzeButton';
import AnalysisResults from '@/components/AnalysisResults';
import { SitemapUrl, AnalysisState, KeywordAnalysis } from '@/types';
import { analyzeKeywordOnPage, fetchKeywordAnalysisResults } from '@/utils/keywordAnalysisService';
import { AlertCircle, BarChart, History } from 'lucide-react';


const Index = () => {
  const [sitemapUrls, setSitemapUrls] = useState<SitemapUrl[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    results: [],
    error: null,
  });
  const [historyResults, setHistoryResults] = useState<KeywordAnalysis[]>([]);

  // Load history data when the component mounts or the history tab is selected
  const loadHistoryData = async () => {
    try {
      const results = await fetchKeywordAnalysisResults();
      setHistoryResults(results);
    } catch (error) {
      console.error('Error loading history data:', error);
    }
  };

  useEffect(() => {
    // Load history data when the component mounts
    loadHistoryData();
    // Fetch and parse sitemap URLs on mount
    const fetchAndSetSitemap = async () => {
      try {
        const sitemapUrl = import.meta.env.VITE_SITEMAP_URL;
        if (!sitemapUrl) throw new Error('Sitemap URL not set in .env');
        const response = await fetch(sitemapUrl);
        if (!response.ok) throw new Error('Failed to fetch sitemap');
        const xmlText = await response.text();
        // parseXml is imported from utils/xmlParser
        const { parseXml } = await import('@/utils/xmlParser');
        const urls = parseXml(xmlText);
        setSitemapUrls(urls);
      } catch (err) {
        setAnalysisState(prev => ({ ...prev, error: 'Failed to load sitemap: ' + (err instanceof Error ? err.message : String(err)) }));
      }
    };
    fetchAndSetSitemap();
  }, []);

  const handleSitemapLoaded = (urls: SitemapUrl[]) => {
    setSitemapUrls(urls);
  };

  const handlePageSelected = (url: string) => {
    setSelectedUrl(url);
  };

  const handleKeywordsChange = (newKeywords: string[]) => {
    setKeywords(newKeywords);
  };

  const handleAnalyze = async () => {
    if (!selectedUrl) {
      setAnalysisState({
        ...analysisState,
        error: 'Please select a URL to analyze',
      });
      return;
    }

    if (keywords.length === 0) {
      setAnalysisState({
        ...analysisState,
        error: 'Please add at least one keyword to analyze',
      });
      return;
    }

    setAnalysisState({
      ...analysisState,
      isAnalyzing: true,
      error: null,
    });

    try {
      // Analyze each keyword one by one
      const results: KeywordAnalysis[] = [];
      
      for (const keyword of keywords) {
        const result = await analyzeKeywordOnPage(selectedUrl, keyword);
        results.push(result);
      }

      setAnalysisState({
        isAnalyzing: false,
        results: results,
        error: null,
      });
      
      // Refresh history data after analysis
      loadHistoryData();
    } catch (error) {
      setAnalysisState({
        ...analysisState,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  const canAnalyze = selectedUrl !== '' && keywords.length > 0 && !analysisState.isAnalyzing;

  return (
    <div className="w-full min-h-screen bg-gray-50 md:bg-white flex flex-col items-center px-2 sm:px-4">
      <Tabs defaultValue="analyze" className="w-full max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto mt-4 md:mt-8">
        <TabsList className="w-full grid grid-cols-2 mb-4 md:mb-6">
          <TabsTrigger value="analyze" className="text-xs md:text-base py-2"> <BarChart className="mr-2 h-4 w-4" /> Analyze </TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-base py-2"> <History className="mr-2 h-4 w-4" /> History </TabsTrigger>
        </TabsList>
        <TabsContent value="analyze">
          <div className="space-y-4 md:space-y-6">
            <Card className="rounded-lg shadow-sm border overflow-x-auto">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Step 1: Select Page</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Choose a page from the sitemap to analyze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PageSelector 
                  urls={sitemapUrls} 
                  onPageSelected={handlePageSelected} 
                  selectedUrl={selectedUrl}
                />
              </CardContent>
            </Card>
            <Card className="rounded-lg shadow-sm border overflow-x-auto">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Step 2: Enter Keywords</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Add keywords you want to analyze (separate with commas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeywordInput onKeywordsChange={handleKeywordsChange} />
              </CardContent>
            </Card>
            <div className="flex flex-col items-stretch md:items-center gap-2">
              <AnalyzeButton 
                onClick={handleAnalyze} 
                isLoading={analysisState.isAnalyzing} 
                disabled={analysisState.isAnalyzing}
                className="w-full md:w-auto py-3 text-base md:text-lg"
              >
                Analyze
              </AnalyzeButton>
            </div>
            {analysisState.error && (
              <Alert variant="destructive" className="mt-2 md:mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs md:text-base">{analysisState.error}</AlertDescription>
              </Alert>
            )}
            {analysisState.results.length > 0 && (
              <div className="overflow-x-auto rounded-md border bg-white p-2 shadow-sm mt-2 md:mt-4">
                <AnalysisResults results={analysisState.results} />
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="history">
          <div className="overflow-x-auto rounded-md border bg-white p-2 shadow-sm mt-2 md:mt-4">
            <AnalysisResults results={historyResults} />
          </div>
          {historyResults.length === 0 && (
            <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md border border-dashed">
              <p className="text-gray-500">
                No analysis history found. Run some analysis first.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
