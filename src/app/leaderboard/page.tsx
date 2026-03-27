'use client';

import { Header } from '@/components/layout/Header';
import { TickerTape } from '@/components/trading/TickerTape';
import { Trophy, Medal, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/format';

// Mock leaderboard data
const LEADERBOARD = [
  { rank: 1, name: 'Priya Sharma', returns: 32.5, portfolio: 1325000, trades: 142 },
  { rank: 2, name: 'Rahul Verma', returns: 28.3, portfolio: 1283000, trades: 98 },
  { rank: 3, name: 'Ankit Patel', returns: 24.1, portfolio: 1241000, trades: 201 },
  { rank: 4, name: 'Sneha Gupta', returns: 19.7, portfolio: 1197000, trades: 67 },
  { rank: 5, name: 'Vikram Singh', returns: 15.2, portfolio: 1152000, trades: 156 },
  { rank: 6, name: 'Neha Reddy', returns: 12.8, portfolio: 1128000, trades: 88 },
  { rank: 7, name: 'Arjun Kumar', returns: 9.4, portfolio: 1094000, trades: 45 },
  { rank: 8, name: 'Kavita Iyer', returns: 6.1, portfolio: 1061000, trades: 112 },
  { rank: 9, name: 'Rohan Desai', returns: -2.3, portfolio: 977000, trades: 78 },
  { rank: 10, name: 'Meera Joshi', returns: -5.8, portfolio: 942000, trades: 134 },
];

export default function LeaderboardPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <TickerTape />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-7 h-7 text-yellow-500" />
            <h1 className="text-2xl font-bold">Leaderboard</h1>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Top traders ranked by portfolio returns. Start trading to appear on the leaderboard!
          </p>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-card text-xs text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium w-16">Rank</th>
                  <th className="text-left py-3 px-4 font-medium">Trader</th>
                  <th className="text-right py-3 px-4 font-medium">Returns</th>
                  <th className="text-right py-3 px-4 font-medium">Portfolio Value</th>
                  <th className="text-right py-3 px-4 font-medium">Trades</th>
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD.map((trader) => (
                  <tr key={trader.rank} className="border-t border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-4">
                      {trader.rank <= 3 ? (
                        <Medal className={`w-5 h-5 ${
                          trader.rank === 1 ? 'text-yellow-500' :
                          trader.rank === 2 ? 'text-gray-400' :
                          'text-amber-600'
                        }`} />
                      ) : (
                        <span className="text-muted-foreground font-mono">{trader.rank}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {trader.name.charAt(0)}
                        </div>
                        <span className="font-medium">{trader.name}</span>
                      </div>
                    </td>
                    <td className={`text-right py-3 px-4 font-mono font-medium ${trader.returns >= 0 ? 'text-profit' : 'text-loss'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {trader.returns >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {formatPercent(trader.returns)}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-mono">
                      {formatCurrency(trader.portfolio)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-muted-foreground">
                      {trader.trades}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center text-xs text-muted-foreground mt-4">
            Leaderboard updates daily. Connect with Supabase to enable real rankings.
          </div>
        </div>
      </div>
    </div>
  );
}
