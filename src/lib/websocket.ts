'use client';

import { useMarketStore } from '@/stores/market-store';
import type { StockQuote } from '@/types';

class FinnhubWebSocket {
  private ws: WebSocket | null = null;
  private subscribedSymbols = new Set<string>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`wss://ws.finnhub.io?token=${this.apiKey}`);

    this.ws.onopen = () => {
      useMarketStore.getState().setConnected(true);
      // Re-subscribe all symbols
      this.subscribedSymbols.forEach((symbol) => {
        this.ws?.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'trade' && data.data) {
        const store = useMarketStore.getState();
        data.data.forEach((trade: { s: string; p: number; v: number; t: number }) => {
          const existing = store.prices[trade.s];
          if (existing) {
            store.setPrice(trade.s, {
              ...existing,
              price: trade.p,
              change: trade.p - existing.previousClose,
              changePercent: ((trade.p - existing.previousClose) / existing.previousClose) * 100,
              volume: (existing.volume || 0) + trade.v,
              timestamp: trade.t,
            });
          }
        });
      }
    };

    this.ws.onclose = () => {
      useMarketStore.getState().setConnected(false);
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  subscribe(symbol: string) {
    this.subscribedSymbols.add(symbol);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }

  unsubscribe(symbol: string) {
    this.subscribedSymbols.delete(symbol);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}

// CoinCap WebSocket for crypto
class CoinCapWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect(assets: string[] = ['bitcoin', 'ethereum', 'solana']) {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(
      `wss://ws.coincap.io/prices?assets=${assets.join(',')}`
    );

    const symbolMap: Record<string, string> = {
      bitcoin: 'BTC-USD',
      ethereum: 'ETH-USD',
      solana: 'SOL-USD',
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const store = useMarketStore.getState();

      Object.entries(data).forEach(([asset, priceStr]) => {
        const symbol = symbolMap[asset] || asset.toUpperCase() + '-USD';
        const price = parseFloat(priceStr as string);
        const existing = store.prices[symbol];

        store.setPrice(symbol, {
          symbol,
          name: asset.charAt(0).toUpperCase() + asset.slice(1),
          price,
          change: existing ? price - existing.previousClose : 0,
          changePercent: existing ? ((price - existing.previousClose) / existing.previousClose) * 100 : 0,
          high: existing ? Math.max(existing.high, price) : price,
          low: existing ? Math.min(existing.low, price) : price,
          open: existing?.open || price,
          previousClose: existing?.previousClose || price,
          volume: 0,
          market: 'CRYPTO',
          currency: 'USD',
          timestamp: Date.now(),
        });
      });
    };

    this.ws.onclose = () => {
      this.reconnectTimer = setTimeout(() => this.connect(assets), 5000);
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}

// Polling for Indian/Yahoo markets
class MarketPoller {
  private timer: ReturnType<typeof setInterval> | null = null;

  start(symbols: string[], intervalMs = 10000) {
    this.stop();
    this.poll(symbols); // immediate first poll

    this.timer = setInterval(() => this.poll(symbols), intervalMs);
  }

  private async poll(symbols: string[]) {
    try {
      const res = await fetch(`/api/market/quote?symbols=${symbols.join(',')}`);
      if (res.ok) {
        const quotes: StockQuote[] = await res.json();
        useMarketStore.getState().setPrices(quotes);
      }
    } catch {
      // silently retry next interval
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

// Singleton instances
let finnhubWS: FinnhubWebSocket | null = null;
let coinCapWS: CoinCapWebSocket | null = null;
let marketPoller: MarketPoller | null = null;

export function initializeWebSockets(finnhubKey?: string) {
  if (finnhubKey) {
    finnhubWS = new FinnhubWebSocket(finnhubKey);
    finnhubWS.connect();
  }

  coinCapWS = new CoinCapWebSocket();
  coinCapWS.connect();

  return { finnhubWS, coinCapWS };
}

export function initializePoller(symbols: string[]) {
  marketPoller = new MarketPoller();
  marketPoller.start(symbols);
  return marketPoller;
}

export function cleanupConnections() {
  finnhubWS?.disconnect();
  coinCapWS?.disconnect();
  marketPoller?.stop();
}

export { FinnhubWebSocket, CoinCapWebSocket, MarketPoller };
