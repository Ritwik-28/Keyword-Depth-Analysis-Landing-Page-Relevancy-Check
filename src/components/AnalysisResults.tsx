import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeywordAnalysis } from '@/types';
import { Laptop, Smartphone, Percent } from 'lucide-react';
import ImageModal from './ImageModal';

interface AnalysisResultsProps {
  results: KeywordAnalysis[];
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (results.length === 0) {
    return null;
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <span className="text-blue-700 mr-2">Keywords Analysis Results</span>
            <Badge variant="outline" className="ml-auto">
              {results.length} keywords analyzed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[240px]">Page URL</TableHead>
                <TableHead className="w-[120px]">Keyword</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <Laptop size={16} className="mr-1" />
                    <span>Desktop Depth</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <Laptop size={16} className="mr-1" />
                    <span>Desktop View</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <Smartphone size={16} className="mr-1" />
                    <span>Mobile Depth</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <Smartphone size={16} className="mr-1" />
                    <span>Mobile View</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => {
                const hasScreenshotError = !!(result.screenshotErrors?.desktop || result.screenshotErrors?.mobile);
                return (
                  <React.Fragment key={index}>
                    <TableRow className={hasScreenshotError ? 'bg-yellow-50' : ''}>
                      <TableCell>
                        <a
                          href={result.pageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs break-all text-blue-800 underline"
                        >
                          {result.pageUrl}
                        </a>
                      </TableCell>
                      <TableCell className="font-medium">{result.keyword}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div 
                            className={`w-16 h-4 rounded-full mr-2 ${getDepthColor(result.desktopDepth)}`}
                          >
                            <div 
                              className="h-full rounded-full bg-blue-600" 
                              style={{ width: `${result.desktopDepth}%` }} 
                            />
                          </div>
                          <span className="text-sm flex items-center">
                            {result.desktopDepth}<Percent size={12} />
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
  <img 
    src={result.desktopScreenshot} 
    alt={`Desktop screenshot for ${result.keyword}`} 
    className="w-20 h-12 object-cover rounded border border-gray-200 cursor-pointer"
    onClick={() => handleImageClick(result.desktopScreenshot)}
  />
  {typeof result.desktopScrollDepth === 'number' && (
    <div className="flex items-center gap-1 mt-1">
      <span
        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getDepthColor(result.desktopScrollDepth)}`}
        style={{ minWidth: 80 }}
      >
        {result.desktopScrollDepth === 100
          ? 'Not found'
          : `${result.desktopScrollDepth}%`}
      </span>
      <span className="text-xs text-gray-700">
        {result.desktopScrollDepth === 100
          ? 'Keyword not found (100% scroll depth)'
          : 'Keyword found at this scroll depth.'}
      </span>
      <span className="ml-1">
        <span className="relative group cursor-pointer">
          <svg width="12" height="12" fill="currentColor" className="inline-block text-gray-400">
            <circle cx="6" cy="6" r="6" />
            <text x="6" y="9" textAnchor="middle" fontSize="8" fill="#fff">i</text>
          </svg>
          <span className="absolute left-1/2 z-10 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 -translate-x-1/2 mt-1 whitespace-nowrap">
            This is the percentage down the page where the first keyword occurrence was found.
          </span>
        </span>
      </span>
    </div>
  )}
</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div 
                            className={`w-16 h-4 rounded-full mr-2 ${getDepthColor(result.mobileDepth)}`}
                          >
                            <div 
                              className="h-full rounded-full bg-teal-600" 
                              style={{ width: `${result.mobileDepth}%` }} 
                            />
                          </div>
                          <span className="text-sm flex items-center">
                            {result.mobileDepth}<Percent size={12} />
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
  <img 
    src={result.mobileScreenshot} 
    alt={`Mobile screenshot for ${result.keyword}`} 
    className="w-10 h-16 object-cover rounded border border-gray-200 cursor-pointer"
    onClick={() => handleImageClick(result.mobileScreenshot)}
  />
  {typeof result.mobileScrollDepth === 'number' && (
    <div className="flex items-center gap-1 mt-1">
      <span
        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getDepthColor(result.mobileScrollDepth)}`}
        style={{ minWidth: 80 }}
      >
        {result.mobileScrollDepth === 100
          ? 'Not found'
          : `${result.mobileScrollDepth}%`}
      </span>
      <span className="text-xs text-gray-700">
        {result.mobileScrollDepth === 100
          ? 'Keyword not found (100% scroll depth)'
          : 'Keyword found at this scroll depth.'}
      </span>
      <span className="ml-1">
        <span className="relative group cursor-pointer">
          <svg width="12" height="12" fill="currentColor" className="inline-block text-gray-400">
            <circle cx="6" cy="6" r="6" />
            <text x="6" y="9" textAnchor="middle" fontSize="8" fill="#fff">i</text>
          </svg>
          <span className="absolute left-1/2 z-10 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 -translate-x-1/2 mt-1 whitespace-nowrap">
            This is the percentage down the page where the first keyword occurrence was found.
          </span>
        </span>
      </span>
    </div>
  )}
</TableCell>
                    </TableRow>
                    {hasScreenshotError && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-yellow-100 text-yellow-900 text-xs p-2 border-t-0">
                          <span className="font-semibold mr-2">⚠️ Screenshot Warning:</span>
                          {result.screenshotErrors?.desktop && (
                            <span className="mr-4">Desktop: {result.screenshotErrors.desktop}</span>
                          )}
                          {result.screenshotErrors?.mobile && (
                            <span>Mobile: {result.screenshotErrors.mobile}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedImage && (
        <ImageModal 
          isOpen={!!selectedImage} 
          onClose={handleCloseModal} 
          imageUrl={selectedImage} 
        />
      )}
    </>
  );
};

// Helper function to get color based on depth percentage
function getDepthColor(depth: number): string {
  if (depth <= 25) {
    return 'bg-green-100';
  } else if (depth <= 50) {
    return 'bg-blue-100';
  } else if (depth <= 75) {
    return 'bg-yellow-100';
  } else {
    return 'bg-red-100';
  }
}

export default AnalysisResults;
