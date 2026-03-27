'use client';

import { useEffect } from 'react';
import { useMarketStore } from '@/stores/market-store';
import { formatNumber, formatPercent } from '@/lib/format';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function TickerTape() {
  const indices = useMarketStore((s) => s.indices);

  useEffect(() => {
    async function fetchIndices() {
      try {
        const res = await fetch('/api/market/indices');
        if (res.ok) {
          const data = await res.json();
          useMarketStore.getState().setIndices(data);
        }
      } catch { /* retry on next interval */ }
    }
    fetchIndices();
    const interval = setInterval(fetchIndices, 30000);
    return () => clearInterval(interval);
  }, []);

  if (indices.length === 0) {
    return (
      <div className="h-8 bg-card border-b border-border flex items-center px-4">
        <div className="flex gap-8 text-xs text-muted-foreground">
          Loading market data...
        </div>
      </div>
    );
  }

  const items = [...indices, ...indices]; // duplicate for infinite scroll

  return (
    <div className="h-8 bg-card/80 backdrop-blur border-b border-border overflow-hidden">
      <div className="ticker-animate flex items-center h-full whitespace-nowrap">
        {items.map((index, i) => (
          <div
            key={`${index.symbol}-${i}`}
            className="inline-flex items-center gap-2 px-4 text-xs"
          >
            <span className="font-medium text-foreground">{index.shortName}</span>
            <span className="text-foreground/80">{formatNumber(index.price, index.price > 1000 ? 0 : 2)}</span>
            <span className={`inline-flex items-center gap-0.5 ${index.changePercent >= 0 ? 'text-profit' : 'text-loss'}`}>
              {index.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {formatPercent(index.changePercent)}
            </span>
            <span className="text-border">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
