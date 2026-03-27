import { NextResponse } from 'next/server';
import { getIndices } from '@/lib/market-data';

export const revalidate = 30; // Cache for 30 seconds

export async function GET() {
  const indices = await getIndices();
  return NextResponse.json(indices);
}
