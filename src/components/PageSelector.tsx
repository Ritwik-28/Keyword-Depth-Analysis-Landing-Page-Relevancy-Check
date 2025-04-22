
import React, { useState, useRef, useEffect } from 'react';
import { SitemapUrl } from '@/types';
import { Search } from 'lucide-react';

interface PageSelectorProps {
  urls: SitemapUrl[];
  onPageSelected: (url: string) => void;
  selectedUrl?: string;
}

const PageSelector: React.FC<PageSelectorProps> = ({ urls, onPageSelected, selectedUrl }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Remove local selectedUrl state; rely on parent for selectedUrl
  // const [selectedUrl, setSelectedUrl] = useState<string>('');
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

  let filteredUrls = urls;
  if (searchTerm.trim() !== '') {
    const lowerSearch = searchTerm.toLowerCase();
    const firstMatchIdx = urls.findIndex(item => item.url.toLowerCase().includes(lowerSearch));
    if (firstMatchIdx !== -1) {
      // Bring first match to top, keep rest in BFS order
      filteredUrls = [urls[firstMatchIdx], ...urls.slice(0, firstMatchIdx), ...urls.slice(firstMatchIdx + 1)].filter((v, i, arr) => arr.findIndex(x => x.url === v.url) === i);
    }
    // Optionally, filter out non-matches for a tighter search:
    // filteredUrls = filteredUrls.filter(item => item.url.toLowerCase().includes(lowerSearch));
  }

  const handleSelectUrl = (url: string) => {
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
          <div
            className="fixed z-50 left-1/2 transform -translate-x-1/2 mt-2 w-[90vw] max-w-xl bg-white border rounded-md shadow-lg"
            style={{ top: dropdownRef.current?.getBoundingClientRect().bottom || 100 }}
          >
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
            <ul className="overflow-y-auto max-h-[80vh]">
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
              {/* Allow manual URL entry if not in list and valid URL */}
              {searchTerm.trim() && !urls.some(u => u.url === searchTerm.trim()) && (() => {
                let isValid = false;
                try {
                  const url = new URL(searchTerm.trim());
                  isValid = url.protocol === 'http:' || url.protocol === 'https:';
                } catch {}
                if (isValid) {
                  return (
                    <li
                      className="px-4 py-2 cursor-pointer text-green-700 hover:bg-green-50 font-medium border-t border-gray-100"
                      onClick={() => handleSelectUrl(searchTerm.trim())}
                    >
                      Use this URL: <span className="underline">{searchTerm.trim()}</span>
                    </li>
                  );
                } else {
                  return (
                    <li className="px-4 py-2 text-red-600 font-medium border-t border-gray-100">
                      Please enter a valid URL (including http(s)://)
                    </li>
                  );
                }
              })()}

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
