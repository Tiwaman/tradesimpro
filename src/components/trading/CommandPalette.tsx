'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { useUIStore } from '@/stores/ui-store';
import { useMarketStore } from '@/stores/market-store';
import { Search, TrendingUp, Star, Plus } from 'lucide-react';
import type { SearchResult } from '@/types';

export function CommandPalette() {
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);
  const setActiveSymbol = useMarketStore((s) => s.setActiveSymbol);
  const addToWatchlist = useMarketStore((s) => s.addToWatchlist);
  const watchlist = useMarketStore((s) => s.watchlist);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 1) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch { /* ignore */ }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback((symbol: string) => {
    setActiveSymbol(symbol);
    if (!watchlist.includes(symbol)) {
      addToWatchlist(symbol);
    }
    setOpen(false);
    setQuery('');
  }, [setActiveSymbol, addToWatchlist, watchlist, setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search stocks, indices, crypto..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isSearching ? 'Searching...' : query ? 'No results found.' : 'Type to search stocks...'}
        </CommandEmpty>

        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((result) => {
              const inWatchlist = watchlist.includes(result.symbol);
              return (
                <CommandItem
                  key={result.symbol}
                  value={result.symbol}
                  onSelect={() => handleSelect(result.symbol)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{result.symbol}</div>
                      <div className="text-xs text-muted-foreground">{result.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
                      {result.market}
                    </span>
                    {inWatchlist ? (
                      <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {!query && (
          <CommandGroup heading="Popular">
            {['RELIANCE.NS', 'TCS.NS', 'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'].map((sym) => (
              <CommandItem
                key={sym}
                value={sym}
                onSelect={() => handleSelect(sym)}
                className="cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-muted-foreground mr-2" />
                {sym.replace('.NS', '')}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
