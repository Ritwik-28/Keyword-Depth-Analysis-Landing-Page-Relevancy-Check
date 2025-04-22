
import React, { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SitemapUrl } from '@/types';
import { Search } from 'lucide-react';

interface PageSelectorProps {
  urls: SitemapUrl[];
  onPageSelected: (url: string) => void;
}

const PageSelector: React.FC<PageSelectorProps> = ({ urls, onPageSelected }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUrls, setFilteredUrls] = useState<SitemapUrl[]>(urls);
  const [selectedUrl, setSelectedUrl] = useState<string>('');

  useEffect(() => {
    if (searchTerm) {
      const filtered = urls.filter(item => 
        item.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUrls(filtered);
    } else {
      setFilteredUrls(urls);
    }
  }, [searchTerm, urls]);

  const handleSelectUrl = (value: string) => {
    setSelectedUrl(value);
    onPageSelected(value);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Filter URLs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select onValueChange={handleSelectUrl} value={selectedUrl}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a page to analyze" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {filteredUrls.length > 0 ? (
            filteredUrls.map((item, index) => (
              <SelectItem key={index} value={item.url}>
                {item.url}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-center text-sm text-gray-500">
              No URLs match your search
            </div>
          )}
        </SelectContent>
      </Select>

      {selectedUrl && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
          <div className="text-sm text-blue-700">
            Selected URL: <span className="font-medium">{selectedUrl}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageSelector;
