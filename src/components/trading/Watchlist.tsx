'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMarketStore } from '@/stores/market-store';
import { formatNumber, formatPercent } from '@/lib/format';
import { Star, Plus, X, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';

function WatchlistItem({ symbol }: { symbol: string }) {
  const quote = useMarketStore((s) => s.prices[symbol]);
  const activeSymbol = useMarketStore((s) => s.activeSymbol);
  const setActiveSymbol = useMarketStore((s) => s.setActiveSymbol);
  const removeFromWatchlist = useMarketStore((s) => s.removeFromWatchlist);
  const prevPriceRef = useRef<number>(0);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (quote && prevPriceRef.current !== 0 && quote.price !== prevPriceRef.current) {
      const el = flashRef.current;
      if (el) {
        el.classList.remove('price-up', 'price-down');
        void el.offsetWidth; // trigger reflow
        el.classList.add(quote.price > prevPriceRef.current ? 'price-up' : 'price-down');
      }
    }
    if (quote) prevPriceRef.current = quote.price;
  }, [quote?.price, quote]);

  const isActive = symbol === activeSymbol;

  return (
    <div
      ref={flashRef}
      onClick={() => setActiveSymbol(symbol)}
      className={`group flex items-center justify-between px-3 py-2 cursor-pointer rounded-md transition-colors ${
        isActive ? 'bg-accent' : 'hover:bg-accent/50'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Star className={`w-3 h-3 ${isActive ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
          <span className="text-sm font-medium truncate">
            {symbol.replace('.NS', '').replace('.BO', '')}
          </span>
        </div>
        {quote && (
          <span className="text-[10px] text-muted-foreground ml-4.5">
            {quote.name?.slice(0, 20)}
          </span>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        {quote ? (
          <>
            <div className="text-sm font-mono">{formatNumber(quote.price)}</div>
            <div className={`text-[10px] font-mono ${quote.changePercent >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatPercent(quote.changePercent)}
            </div>
          </>
        ) : (
          <div className="text-xs text-muted-foreground">--</div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); removeFromWatchlist(symbol); }}
        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3 text-muted-foreground hover:text-loss" />
      </button>
    </div>
  );
}

export function Watchlist() {
  const watchlist = useMarketStore((s) => s.watchlist);
  const setCommandOpen = useUIStore((s) => s.setCommandOpen);

  const indianSymbols = watchlist.filter(s => s.endsWith('.NS') || s.endsWith('.BO'));
  const usSymbols = watchlist.filter(s => !s.endsWith('.NS') && !s.endsWith('.BO') && !s.includes('-'));
  const cryptoSymbols = watchlist.filter(s => s.includes('-'));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Watchlist
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setCommandOpen(true)}
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {indianSymbols.length > 0 && (
          <div className="mb-2">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Indian
            </div>
            {indianSymbols.map((symbol) => (
              <WatchlistItem key={symbol} symbol={symbol} />
            ))}
          </div>
        )}

        {usSymbols.length > 0 && (
          <div className="mb-2">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              US Markets
            </div>
            {usSymbols.map((symbol) => (
              <WatchlistItem key={symbol} symbol={symbol} />
            ))}
          </div>
        )}

        {cryptoSymbols.length > 0 && (
          <div>
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Crypto
            </div>
            {cryptoSymbols.map((symbol) => (
              <WatchlistItem key={symbol} symbol={symbol} />
            ))}
          </div>
        )}

        {watchlist.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
            <Star className="w-6 h-6 mb-2" />
            <p>No stocks in watchlist</p>
            <button
              onClick={() => setCommandOpen(true)}
              className="text-primary text-xs mt-1 hover:underline"
            >
              Add stocks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
