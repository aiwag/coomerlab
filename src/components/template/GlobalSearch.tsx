import React, { useEffect, useRef } from 'react';
import { useSearchStore } from '@/state/useSearchStore';
import { useDebounce } from '@/hooks/useDebounce'; // Assuming you have this hook
import { Link } from '@tanstack/react-router';
import { Search, Zap, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function GlobalSearch() {
  const { query, setQuery, results, isOpen, setIsOpen } = useSearchStore();
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(debouncedQuery);
  }, [debouncedQuery, setQuery]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);


  return (
    <div ref={searchRef} className="relative mx-4 hidden max-w-xs flex-1 md:flex lg:max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-10">
        <Search size={16} className="text-gray-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="relative block w-full rounded-lg border border-white/10 bg-white/5 p-2 pl-10 text-sm text-white placeholder-gray-400 focus:border-transparent focus:ring-1 focus:ring-purple-500 focus:outline-none"
        placeholder="Search pages, streamers, and more..."
      />
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full rounded-lg border border-white/10 bg-black/50 backdrop-blur-xl p-2 space-y-1"
          >
            {results.map((item, index) => (
              <Link key={index} to={item.to || '/'} onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors">
                <div className="text-purple-400">
                    {item.type === 'page' && <Zap size={16} />}
                    {item.type === 'streamer' && <Video size={16} />}
                </div>
                <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}