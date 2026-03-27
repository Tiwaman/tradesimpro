import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { StockQuote, MarketIndex } from '@/types';

interface MarketStore {
  prices: Record<string, StockQuote>;
  indices: MarketIndex[];
  watchlist: string[];
  activeSymbol: string;
  isConnected: boolean;
  setPrice: (symbol: string, quote: StockQuote) => void;
  setPrices: (quotes: StockQuote[]) => void;
  setIndices: (indices: MarketIndex[]) => void;
  setWatchlist: (symbols: string[]) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  setActiveSymbol: (symbol: string) => void;
  setConnected: (connected: boolean) => void;
}

export const useMarketStore = create<MarketStore>()(
  subscribeWithSelector((set) => ({
    prices: {},
    indices: [],
    watchlist: [
      'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
      'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA',
    ],
    activeSymbol: 'RELIANCE.NS',
    isConnected: false,

    setPrice: (symbol, quote) =>
      set((state) => ({
        prices: { ...state.prices, [symbol]: quote },
      })),

    setPrices: (quotes) =>
      set((state) => {
        const newPrices = { ...state.prices };
        quotes.forEach((q) => { newPrices[q.symbol] = q; });
        return { prices: newPrices };
      }),

    setIndices: (indices) => set({ indices }),

    setWatchlist: (symbols) => set({ watchlist: symbols }),

    addToWatchlist: (symbol) =>
      set((state) => ({
        watchlist: state.watchlist.includes(symbol)
          ? state.watchlist
          : [...state.watchlist, symbol],
      })),

    removeFromWatchlist: (symbol) =>
      set((state) => ({
        watchlist: state.watchlist.filter((s) => s !== symbol),
      })),

    setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),

    setConnected: (connected) => set({ isConnected: connected }),
  }))
);
