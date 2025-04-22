
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, X } from 'lucide-react';

interface KeywordInputProps {
  onKeywordsChange: (keywords: string[]) => void;
}

// NOTE: If you add dropdowns here, use a Portal and z-50/fixed positioning for dropdown menus to prevent clipping inside containers.
const KeywordInput: React.FC<KeywordInputProps> = ({ onKeywordsChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    setError(null);
  };

  const handleInputBlur = () => {
    processInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processInput();
    }
  };

  const processInput = () => {
    if (!inputValue.trim()) return;

    // Split by commas, filter out empty strings, and trim whitespace
    const newKeywords = inputValue
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (newKeywords.length === 0) {
      setError('Please enter at least one keyword');
      return;
    }

    if (newKeywords.some(k => k.length > 50)) {
      setError('Keywords should be less than 50 characters');
      return;
    }

    const uniqueKeywords = Array.from(new Set([...keywords, ...newKeywords]));
    setKeywords(uniqueKeywords);
    onKeywordsChange(uniqueKeywords);
    setInputValue('');
  };

  const removeKeyword = (keywordToRemove: string) => {
    const updatedKeywords = keywords.filter(k => k !== keywordToRemove);
    setKeywords(updatedKeywords);
    onKeywordsChange(updatedKeywords);
  };

  return (
    <div className="space-y-3">
      <div>
        <Textarea
          placeholder="Enter keywords separated by commas (e.g., SEO, marketing, analytics)"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          rows={3}
          className="resize-none"
        />
        {error && (
          <div className="flex items-center mt-1 text-sm text-red-500">
            <AlertCircle size={14} className="mr-1" />
            {error}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <Badge key={index} variant="secondary" className="py-1.5 px-3 bg-blue-50 text-blue-700 border border-blue-200">
            {keyword}
            <button 
              onClick={() => removeKeyword(keyword)} 
              className="ml-2 text-blue-500 hover:text-blue-700"
            >
              <X size={14} />
            </button>
          </Badge>
        ))}
        {keywords.length === 0 && (
          <div className="text-sm text-gray-500">
            No keywords added yet. Type keywords above and press Enter.
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordInput;
