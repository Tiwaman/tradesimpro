export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  market: 'NSE' | 'BSE' | 'NYSE' | 'NASDAQ' | 'CRYPTO' | 'INDEX';
  currency: string;
  timestamp: number;
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Position {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  market: string;
  currentPrice?: number;
  pnl?: number;
  pnlPercent?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  market: string;
  timestamp: string;
}

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP';
  quantity: number;
  price: number;
  triggerPrice?: number;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  market: string;
  createdAt: string;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  symbols: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string;
  virtualBalance: number;
  currency: string;
  createdAt: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  shortName: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  market: string;
}
