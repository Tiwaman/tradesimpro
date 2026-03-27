import { NextRequest, NextResponse } from 'next/server';
import { executeBuy } from '@/lib/trade-engine';

export async function POST(request: NextRequest) {
  try {
    const { userId, symbol, name, quantity, price, market } = await request.json();

    if (!userId || !symbol || !quantity || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await executeBuy(userId, symbol, name || symbol, quantity, price, market || 'NSE');

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Trade execution failed' }, { status: 500 });
  }
}
