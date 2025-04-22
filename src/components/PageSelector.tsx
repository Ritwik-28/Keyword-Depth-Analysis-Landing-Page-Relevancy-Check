
import React, { useState, useRef, useEffect } from 'react';
import { SitemapUrl } from '@/types';
import { Search } from 'lucide-react';

interface PageSelectorProps {
  urls: SitemapUrl[];
  onPageSelected: (url: string) => void;
}

const PageSelector: React.FC<PageSelectorProps> = ({ urls, onPageSelected }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const filteredUrls = urls.filter(item =>
    item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUrl = (url: string) => {
    setSelectedUrl(url);
    onPageSelected(url);
    setOpen(false);
    setSearchTerm(''); // reset search after selection
  };

  return (
    <div className="space-y-4">
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full px-4 py-2 border rounded-md text-left bg-white hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {selectedUrl || 'Select a page to analyze'}
        </button>
        {open && (
          <div className="absolute z-40 left-0 w-full mt-2 bg-white border rounded-md shadow-lg">
            <div className="flex items-center px-3 py-2 border-b bg-gray-50">
              <Search size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                className="w-full bg-transparent outline-none"
                placeholder="Type to filter URLs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <ul className="max-h-60 overflow-y-auto">
              {filteredUrls.length > 0 ? (
                filteredUrls.map((item, idx) => (
                  <li
                    key={item.url}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                      selectedUrl === item.url ? 'bg-blue-50 font-medium' : ''
                    }`}
                    onClick={() => handleSelectUrl(item.url)}
                  >
                    {item.url}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">No URLs found</li>
              )}
            </ul>
          </div>
        )}
      </div>

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
