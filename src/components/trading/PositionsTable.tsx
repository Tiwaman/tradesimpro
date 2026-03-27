'use client';

import { usePortfolioStore } from '@/stores/portfolio-store';
import { useMarketStore } from '@/stores/market-store';
import { formatCurrency, formatPercent } from '@/lib/format';
import { TrendingUp, TrendingDown, Briefcase } from 'lucide-react';

export function PositionsTable() {
  const positions = usePortfolioStore((s) => s.positions);
  const prices = useMarketStore((s) => s.prices);
  const setActiveSymbol = useMarketStore((s) => s.setActiveSymbol);

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
        <Briefcase className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No positions yet</p>
        <p className="text-xs">Start trading to see your holdings here</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground border-b border-border">
            <th className="text-left py-2 px-3 font-medium">Symbol</th>
            <th className="text-right py-2 px-3 font-medium">Qty</th>
            <th className="text-right py-2 px-3 font-medium">Avg Price</th>
            <th className="text-right py-2 px-3 font-medium">LTP</th>
            <th className="text-right py-2 px-3 font-medium">P&L</th>
            <th className="text-right py-2 px-3 font-medium">P&L %</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => {
            const currentPrice = prices[pos.symbol]?.price || pos.avgBuyPrice;
            const pnl = (currentPrice - pos.avgBuyPrice) * pos.quantity;
            const pnlPercent = ((currentPrice - pos.avgBuyPrice) / pos.avgBuyPrice) * 100;
            const isProfit = pnl >= 0;

            return (
              <tr
                key={pos.symbol}
                onClick={() => setActiveSymbol(pos.symbol)}
                className="border-b border-border/50 hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <td className="py-2 px-3">
                  <div className="font-medium">{pos.symbol.replace('.NS', '').replace('.BO', '')}</div>
                  <div className="text-[10px] text-muted-foreground">{pos.name?.slice(0, 20)}</div>
                </td>
                <td className="text-right py-2 px-3 font-mono">{pos.quantity}</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(pos.avgBuyPrice)}</td>
                <td className="text-right py-2 px-3 font-mono">{formatCurrency(currentPrice)}</td>
                <td className={`text-right py-2 px-3 font-mono ${isProfit ? 'text-profit' : 'text-loss'}`}>
                  <div className="flex items-center justify-end gap-1">
                    {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {formatCurrency(Math.abs(pnl))}
                  </div>
                </td>
                <td className={`text-right py-2 px-3 font-mono ${isProfit ? 'text-profit' : 'text-loss'}`}>
                  {formatPercent(pnlPercent)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
