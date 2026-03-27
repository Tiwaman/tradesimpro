'use client';

import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { useMarketStore } from '@/stores/market-store';
import { initializePoller, cleanupConnections, initializeWebSockets } from '@/lib/websocket';
import { CommandPalette } from '@/components/trading/CommandPalette';

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize demo user
  useEffect(() => {
    const user = usePortfolioStore.getState().user;
    if (!user) {
      usePortfolioStore.getState().setUser({
        id: 'demo-user',
        email: 'demo@tradesimpro.com',
        name: 'Demo Trader',
        virtualBalance: 1000000,
        currency: 'INR',
        createdAt: new Date().toISOString(),
      });
    }
  }, []);

  // Initialize market data polling
  useEffect(() => {
    const watchlist = useMarketStore.getState().watchlist;

    // Start polling for all watchlist symbols
    const poller = initializePoller(watchlist);

    // Initialize crypto WebSocket (no API key needed)
    initializeWebSockets();

    // Fetch initial portfolio from Supabase
    fetch('/api/trade/portfolio?userId=demo-user')
      .then(res => res.json())
      .then(data => {
        usePortfolioStore.getState().setPositions(data.positions || []);
        usePortfolioStore.getState().setTransactions(data.transactions || []);
        if (data.balance != null) {
          usePortfolioStore.getState().updateBalance(data.balance);
        }
      })
      .catch(() => { /* ok on first load */ });

    // Update poller when watchlist changes
    const unsub = useMarketStore.subscribe(
      (s) => s.watchlist,
      (watchlist) => {
        poller.stop();
        poller.start(watchlist);
      }
    );

    return () => {
      cleanupConnections();
      unsub();
    };
  }, []);

  return (
    <>
      {children}
      <CommandPalette />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          },
        }}
      />
    </>
  );
}
