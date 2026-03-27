'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { TickerTape } from '@/components/trading/TickerTape';
import { useMarketStore } from '@/stores/market-store';
import { formatNumber, formatPercent, formatVolume } from '@/lib/format';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import type { StockQuote } from '@/types';

const MARKET_TABS = [
  { id: 'indian', label: 'Indian', symbols: ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS', 'WIPRO.NS', 'HCLTECH.NS', 'ADANIENT.NS', 'LT.NS', 'BAJFINANCE.NS'] },
  { id: 'us', label: 'US', symbols: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'WMT', 'JNJ', 'PG', 'MA', 'UNH', 'HD'] },
  { id: 'indices', label: 'Indices', symbols: ['^NSEI', '^NSEBANK', '^BSESN', '^GSPC', '^IXIC', '^DJI', '^FTSE', '^N225', '^HSI', '^GDAXI'] },
  { id: 'crypto', label: 'Crypto', symbols: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD', 'ADA-USD', 'DOGE-USD', 'DOT-USD'] },
];

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState('indian');
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const addToWatchlist = useMarketStore((s) => s.addToWatchlist);
  const setActiveSymbol = useMarketStore((s) => s.setActiveSymbol);

  const tab = MARKET_TABS.find(t => t.id === activeTab)!;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/market/quote?symbols=${tab.symbols.join(',')}`)
      .then(res => res.json())
      .then(data => {
        setQuotes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab, tab.symbols]);

  const filtered = quotes.filter(q =>
    !filter || q.symbol.toLowerCase().includes(filter.toLowerCase()) ||
    q.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <TickerTape />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Markets</h1>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4">
            {MARKET_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === t.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter stocks..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-9 bg-secondary border-border"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-card text-xs text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Symbol</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-right py-3 px-4 font-medium">Price</th>
                    <th className="text-right py-3 px-4 font-medium">Change</th>
                    <th className="text-right py-3 px-4 font-medium">Change %</th>
                    <th className="text-right py-3 px-4 font-medium">Volume</th>
                    <th className="text-right py-3 px-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(q => (
                    <tr
                      key={q.symbol}
                      className="border-t border-border/50 hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => { setActiveSymbol(q.symbol); addToWatchlist(q.symbol); }}
                    >
                      <td className="py-3 px-4 font-medium font-mono">
                        {q.symbol.replace('.NS', '').replace('.BO', '')}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {q.name?.slice(0, 30)}
                      </td>
                      <td className="text-right py-3 px-4 font-mono">
                        {formatNumber(q.price)}
                      </td>
                      <td className={`text-right py-3 px-4 font-mono ${q.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {q.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {q.change >= 0 ? '+' : ''}{formatNumber(q.change)}
                        </div>
                      </td>
                      <td className={`text-right py-3 px-4 font-mono ${q.changePercent >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatPercent(q.changePercent)}
                      </td>
                      <td className="text-right py-3 px-4 font-mono text-muted-foreground">
                        {formatVolume(q.volume)}
                      </td>
                      <td className="text-right py-3 px-4">
                        <Link
                          href="/dashboard"
                          onClick={(e) => { e.stopPropagation(); setActiveSymbol(q.symbol); addToWatchlist(q.symbol); }}
                          className="px-3 py-1 text-xs font-medium rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          Trade
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No stocks found matching &quot;{filter}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
