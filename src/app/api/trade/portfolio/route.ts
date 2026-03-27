import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/trade-engine';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId') || 'demo-user';
  const portfolio = await getPortfolio(userId);
  return NextResponse.json(portfolio);
}
