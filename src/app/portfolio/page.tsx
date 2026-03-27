'use client';

import { usePortfolioStore } from '@/stores/portfolio-store';
import { useMarketStore } from '@/stores/market-store';
import { Header } from '@/components/layout/Header';
import { TickerTape } from '@/components/trading/TickerTape';
import { PositionsTable } from '@/components/trading/PositionsTable';
import { TradeHistory } from '@/components/trading/TradeHistory';
import { formatCurrency, formatPercent } from '@/lib/format';
import { Wallet, TrendingUp, TrendingDown, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

export default function PortfolioPage() {
  const user = usePortfolioStore((s) => s.user);
  const positions = usePortfolioStore((s) => s.positions);
  const prices = useMarketStore((s) => s.prices);
  const [tab, setTab] = useState<'positions' | 'history'>('positions');

  // Calculate portfolio metrics
  const investedValue = positions.reduce((sum, p) => sum + p.avgBuyPrice * p.quantity, 0);
  const currentValue = positions.reduce((sum, p) => {
    const price = prices[p.symbol]?.price || p.avgBuyPrice;
    return sum + price * p.quantity;
  }, 0);
  const totalPnl = currentValue - investedValue;
  const totalPnlPercent = investedValue > 0 ? (totalPnl / investedValue) * 100 : 0;
  const totalPortfolioValue = (user?.virtualBalance || 1000000) + currentValue;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <TickerTape />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6">Portfolio</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Wallet className="w-3.5 h-3.5" />
                Total Value
              </div>
              <div className="text-xl font-bold font-mono">{formatCurrency(totalPortfolioValue)}</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Wallet className="w-3.5 h-3.5" />
                Available Cash
              </div>
              <div className="text-xl font-bold font-mono">{formatCurrency(user?.virtualBalance || 1000000)}</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <BarChart3 className="w-3.5 h-3.5" />
                Invested
              </div>
              <div className="text-xl font-bold font-mono">{formatCurrency(investedValue)}</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                {totalPnl >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-profit" /> : <TrendingDown className="w-3.5 h-3.5 text-loss" />}
                Total P&L
              </div>
              <div className={`text-xl font-bold font-mono ${totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
              </div>
              <div className={`text-xs font-mono ${totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                {formatPercent(totalPnlPercent)}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setTab('positions')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === 'positions' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}
            >
              Holdings ({positions.length})
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === 'history' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}
            >
              Trade History
            </button>
          </div>

          {/* Content */}
          <div className="rounded-xl border border-border overflow-hidden bg-card/30">
            {tab === 'positions' ? <PositionsTable /> : <TradeHistory />}
          </div>

          {positions.length === 0 && (
            <div className="text-center mt-8">
              <Link href="/dashboard">
                <Button className="gap-2">
                  Start Trading <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
