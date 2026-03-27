'use client';

import { usePortfolioStore } from '@/stores/portfolio-store';
import { formatCurrency } from '@/lib/format';
import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';

export function TradeHistory() {
  const transactions = usePortfolioStore((s) => s.transactions);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
        <History className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No trades yet</p>
        <p className="text-xs">Your trade history will appear here</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground border-b border-border">
            <th className="text-left py-2 px-3 font-medium">Time</th>
            <th className="text-left py-2 px-3 font-medium">Symbol</th>
            <th className="text-center py-2 px-3 font-medium">Type</th>
            <th className="text-right py-2 px-3 font-medium">Qty</th>
            <th className="text-right py-2 px-3 font-medium">Price</th>
            <th className="text-right py-2 px-3 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
              <td className="py-2 px-3 text-xs text-muted-foreground font-mono">
                {new Date(tx.timestamp).toLocaleString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: 'short',
                })}
              </td>
              <td className="py-2 px-3 font-medium">
                {tx.symbol.replace('.NS', '').replace('.BO', '')}
              </td>
              <td className="py-2 px-3 text-center">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                  tx.type === 'BUY'
                    ? 'bg-profit/10 text-profit'
                    : 'bg-loss/10 text-loss'
                }`}>
                  {tx.type === 'BUY' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                  {tx.type}
                </span>
              </td>
              <td className="text-right py-2 px-3 font-mono">{tx.quantity}</td>
              <td className="text-right py-2 px-3 font-mono">{formatCurrency(tx.price)}</td>
              <td className="text-right py-2 px-3 font-mono font-medium">{formatCurrency(tx.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
