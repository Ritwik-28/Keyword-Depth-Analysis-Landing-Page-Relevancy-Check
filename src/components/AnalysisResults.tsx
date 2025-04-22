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
                <TableHead className="w-[180px]">Keyword</TableHead>
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
              {results.map((result, index) => (
                <TableRow key={index}>
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
                  </TableCell>
                </TableRow>
              ))}
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
