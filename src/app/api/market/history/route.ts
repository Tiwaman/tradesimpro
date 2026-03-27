import { NextRequest, NextResponse } from 'next/server';
import { getHistory } from '@/lib/market-data';

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol');
  const period = (request.nextUrl.searchParams.get('period') || '1mo') as '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y';
  const interval = (request.nextUrl.searchParams.get('interval') || '1d') as '1m' | '5m' | '15m' | '1h' | '1d' | '1wk';

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  const data = await getHistory(symbol, period, interval);
  return NextResponse.json(data);
}
