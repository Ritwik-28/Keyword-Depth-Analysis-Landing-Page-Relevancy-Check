
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled: boolean;
  isAnalyzing: boolean;
}

const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({ 
  onClick, 
  disabled, 
  isAnalyzing 
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isAnalyzing}
      className="w-full md:w-auto bg-teal-600 hover:bg-teal-700"
    >
      {isAnalyzing ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          Analyzing...
        </>
      ) : (
        <>
          <Search size={16} className="mr-2" />
          Analyze Keywords
        </>
      )}
    </Button>
  );
};

export default AnalyzeButton;
