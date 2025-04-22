
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SitemapLoader from '@/components/SitemapLoader';
import PageSelector from '@/components/PageSelector';
import KeywordInput from '@/components/KeywordInput';
import AnalyzeButton from '@/components/AnalyzeButton';
import AnalysisResults from '@/components/AnalysisResults';
import { SitemapUrl, KeywordAnalysis, AnalysisState } from '@/types';
import { mockAnalyzeKeywords } from '@/utils/api';
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
      // In production, use the real API: analyzeKeywords(selectedUrl, keywords)
      const response = await mockAnalyzeKeywords(selectedUrl, keywords);

      if (response.success && response.data) {
        setAnalysisState({
          isAnalyzing: false,
          results: response.data,
          error: null,
        });
      } else {
        setAnalysisState({
          ...analysisState,
          isAnalyzing: false,
          error: response.error || 'Analysis failed',
        });
      }
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Page Depth Explorer</h1>
          <p className="text-gray-600 mt-2">
            Analyze where keywords appear on your web pages for both desktop and mobile devices.
          </p>
        </div>

        <Tabs defaultValue="analyze" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="analyze" className="flex items-center">
              <BarChart size={16} className="mr-2" /> 
              Analyze
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History size={16} className="mr-2" /> 
              History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="analyze" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Load Sitemap</CardTitle>
                <CardDescription>
                  Enter your website's sitemap URL to load available pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SitemapLoader onSitemapLoaded={handleSitemapLoaded} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: Select Page</CardTitle>
                <CardDescription>
                  Choose a specific page from your sitemap to analyze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PageSelector 
                  urls={sitemapUrls} 
                  onPageSelected={handlePageSelected} 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 3: Enter Keywords</CardTitle>
                <CardDescription>
                  Add keywords you want to analyze (separate with commas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeywordInput onKeywordsChange={handleKeywordsChange} />
              </CardContent>
            </Card>

            <div className="flex flex-col space-y-4">
              {analysisState.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{analysisState.error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-center">
                <AnalyzeButton 
                  onClick={handleAnalyze} 
                  disabled={!canAnalyze} 
                  isAnalyzing={analysisState.isAnalyzing} 
                />
              </div>
            </div>

            {analysisState.results.length > 0 && (
              <div className="mt-8">
                <Separator className="my-6" />
                <AnalysisResults results={analysisState.results} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Analysis History</CardTitle>
                <CardDescription>
                  View your previous keyword analysis results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md border border-dashed">
                  <p className="text-gray-500">
                    History feature will be available after authentication setup
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
