import { NextRequest, NextResponse } from 'next/server';
import { getQuote, getMultipleQuotes } from '@/lib/market-data';

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol');
  const symbols = request.nextUrl.searchParams.get('symbols');

  if (symbols) {
    const list = symbols.split(',').map(s => s.trim()).filter(Boolean);
    const quotes = await getMultipleQuotes(list);
    return NextResponse.json(quotes);
  }

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  const quote = await getQuote(symbol);
  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  return NextResponse.json(quote);
}
