import type { StockQuote, CandleData, SearchResult, MarketIndex } from '@/types';

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || '';

const INDEX_MAP: Record<string, { name: string; shortName: string; yahoo: string }> = {
  'NIFTY50': { name: 'NIFTY 50', shortName: 'NIFTY', yahoo: '^NSEI' },
  'BANKNIFTY': { name: 'Bank NIFTY', shortName: 'BNIFTY', yahoo: '^NSEBANK' },
  'SENSEX': { name: 'S&P BSE SENSEX', shortName: 'SENSEX', yahoo: '^BSESN' },
  'SP500': { name: 'S&P 500', shortName: 'S&P500', yahoo: '^GSPC' },
  'NASDAQ': { name: 'NASDAQ Composite', shortName: 'NASDAQ', yahoo: '^IXIC' },
  'DJI': { name: 'Dow Jones', shortName: 'DOW', yahoo: '^DJI' },
  'FTSE': { name: 'FTSE 100', shortName: 'FTSE', yahoo: '^FTSE' },
  'NIKKEI': { name: 'Nikkei 225', shortName: 'NIKKEI', yahoo: '^N225' },
  'HANGSENG': { name: 'Hang Seng', shortName: 'HSI', yahoo: '^HSI' },
  'DAX': { name: 'DAX', shortName: 'DAX', yahoo: '^GDAXI' },
};

const POPULAR_STOCKS: Record<string, { name: string; market: string }> = {
  'RELIANCE.NS': { name: 'Reliance Industries', market: 'NSE' },
  'TCS.NS': { name: 'Tata Consultancy Services', market: 'NSE' },
  'HDFCBANK.NS': { name: 'HDFC Bank', market: 'NSE' },
  'INFY.NS': { name: 'Infosys', market: 'NSE' },
  'ICICIBANK.NS': { name: 'ICICI Bank', market: 'NSE' },
  'HINDUNILVR.NS': { name: 'Hindustan Unilever', market: 'NSE' },
  'ITC.NS': { name: 'ITC Limited', market: 'NSE' },
  'SBIN.NS': { name: 'State Bank of India', market: 'NSE' },
  'BHARTIARTL.NS': { name: 'Bharti Airtel', market: 'NSE' },
  'KOTAKBANK.NS': { name: 'Kotak Mahindra Bank', market: 'NSE' },
  'AAPL': { name: 'Apple Inc.', market: 'NASDAQ' },
  'GOOGL': { name: 'Alphabet Inc.', market: 'NASDAQ' },
  'MSFT': { name: 'Microsoft Corp.', market: 'NASDAQ' },
  'AMZN': { name: 'Amazon.com Inc.', market: 'NASDAQ' },
  'TSLA': { name: 'Tesla Inc.', market: 'NASDAQ' },
  'META': { name: 'Meta Platforms Inc.', market: 'NASDAQ' },
  'NVDA': { name: 'NVIDIA Corp.', market: 'NASDAQ' },
  'JPM': { name: 'JPMorgan Chase', market: 'NYSE' },
  'V': { name: 'Visa Inc.', market: 'NYSE' },
  'WMT': { name: 'Walmart Inc.', market: 'NYSE' },
};

// Price cache to reduce API calls
const priceCache = new Map<string, { data: StockQuote; timestamp: number }>();
const CACHE_TTL = 10000; // 10 seconds

function getCachedPrice(symbol: string): StockQuote | null {
  const cached = priceCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedPrice(symbol: string, data: StockQuote) {
  priceCache.set(symbol, { data, timestamp: Date.now() });
}

export async function getQuote(symbol: string): Promise<StockQuote | null> {
  const cached = getCachedPrice(symbol);
  if (cached) return cached;

  try {
    // Use dynamic import for yahoo-finance2 (server-side only)
    const yahooFinance = (await import('yahoo-finance2')).default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quote: any = await yahooFinance.quote(symbol);

    if (!quote || !quote.regularMarketPrice) return null;

    const market = symbol.endsWith('.NS') ? 'NSE' : symbol.endsWith('.BO') ? 'BSE' :
      symbol.startsWith('^') ? 'INDEX' : 'NYSE';

    const result: StockQuote = {
      symbol,
      name: quote.shortName || quote.longName || symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      high: quote.regularMarketDayHigh || quote.regularMarketPrice,
      low: quote.regularMarketDayLow || quote.regularMarketPrice,
      open: quote.regularMarketOpen || quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
      volume: quote.regularMarketVolume || 0,
      market: market as StockQuote['market'],
      currency: quote.currency || (market === 'NSE' || market === 'BSE' ? 'INR' : 'USD'),
      timestamp: Date.now(),
    };

    setCachedPrice(symbol, result);
    return result;
  } catch {
    return null;
  }
}

export async function getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
  const results = await Promise.allSettled(symbols.map(s => getQuote(s)));
  return results
    .filter((r): r is PromiseFulfilledResult<StockQuote | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((q): q is StockQuote => q !== null);
}

export async function getIndices(): Promise<MarketIndex[]> {
  const symbols = Object.values(INDEX_MAP).map(i => i.yahoo);
  const quotes = await getMultipleQuotes(symbols);

  return Object.entries(INDEX_MAP).map(([key, info]) => {
    const quote = quotes.find(q => q.symbol === info.yahoo);
    return {
      symbol: key,
      name: info.name,
      shortName: info.shortName,
      price: quote?.price || 0,
      change: quote?.change || 0,
      changePercent: quote?.changePercent || 0,
    };
  });
}

export async function getHistory(
  symbol: string,
  period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' = '1mo',
  interval: '1m' | '5m' | '15m' | '1h' | '1d' | '1wk' = '1d'
): Promise<CandleData[]> {
  try {
    const yahooFinance = (await import('yahoo-finance2')).default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yahooFinance.chart(symbol, { period1: getStartDate(period), interval });

    if (!result?.quotes) return [];

    return result.quotes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((q: any) => q.open && q.high && q.low && q.close)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((q: any) => ({
        time: Math.floor(new Date(q.date as string).getTime() / 1000),
        open: q.open as number,
        high: q.high as number,
        low: q.low as number,
        close: q.close as number,
        volume: (q.volume as number) || 0,
      }));
  } catch {
    return [];
  }
}

function getStartDate(period: string): string {
  const now = new Date();
  switch (period) {
    case '1d': now.setDate(now.getDate() - 1); break;
    case '5d': now.setDate(now.getDate() - 5); break;
    case '1mo': now.setMonth(now.getMonth() - 1); break;
    case '3mo': now.setMonth(now.getMonth() - 3); break;
    case '6mo': now.setMonth(now.getMonth() - 6); break;
    case '1y': now.setFullYear(now.getFullYear() - 1); break;
    case '5y': now.setFullYear(now.getFullYear() - 5); break;
  }
  return now.toISOString().split('T')[0];
}

export async function searchStocks(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) return [];

  try {
    // First check popular stocks
    const lowerQuery = query.toLowerCase();
    const popularMatches = Object.entries(POPULAR_STOCKS)
      .filter(([sym, info]) =>
        sym.toLowerCase().includes(lowerQuery) ||
        info.name.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5)
      .map(([sym, info]) => ({
        symbol: sym,
        name: info.name,
        type: 'Stock',
        market: info.market,
      }));

    // Then try yahoo search
    const yahooFinance = (await import('yahoo-finance2')).default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any = await yahooFinance.search(query);

    const yahooResults = (results.quotes || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((q: any) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF' || q.quoteType === 'INDEX')
      .slice(0, 10)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((q: any) => ({
        symbol: q.symbol as string,
        name: (q.shortname || q.longname || q.symbol) as string,
        type: q.quoteType as string,
        market: (q.exchange || 'Unknown') as string,
      }));

    // Merge, dedupe
    const seen = new Set<string>();
    const merged: SearchResult[] = [];
    for (const item of [...popularMatches, ...yahooResults]) {
      if (!seen.has(item.symbol)) {
        seen.add(item.symbol);
        merged.push(item);
      }
    }
    return merged.slice(0, 15);
  } catch {
    return [];
  }
}

export async function getQuoteFromFinnhub(symbol: string): Promise<StockQuote | null> {
  if (!FINNHUB_KEY) return null;
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
    );
    const data = await res.json();
    if (!data || !data.c) return null;

    return {
      symbol,
      name: POPULAR_STOCKS[symbol]?.name || symbol,
      price: data.c,
      change: data.d || 0,
      changePercent: data.dp || 0,
      high: data.h || data.c,
      low: data.l || data.c,
      open: data.o || data.c,
      previousClose: data.pc || data.c,
      volume: 0,
      market: (POPULAR_STOCKS[symbol]?.market || 'NYSE') as StockQuote['market'],
      currency: 'USD',
      timestamp: Date.now(),
    };
  } catch {
    return null;
  }
}

export { INDEX_MAP, POPULAR_STOCKS };
