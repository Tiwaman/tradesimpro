import { getServiceSupabase } from './supabase';
import type { Position, Transaction } from '@/types';

const db = getServiceSupabase();

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_EMAIL = 'demo@tradesimpro.com';
const INITIAL_BALANCE = 1000000;

async function ensureUser(userId: string): Promise<string> {
  // Map non-UUID identifiers to the demo UUID
  const id = (!userId || userId === 'demo-user') ? DEMO_USER_ID : userId;
  const { data } = await db.from('users').select('id').eq('id', id).single();
  if (!data) {
    await db.from('users').upsert({
      id,
      email: id === DEMO_USER_ID ? DEMO_EMAIL : `user-${id}@tradesimpro.com`,
      name: 'Demo Trader',
      balance: INITIAL_BALANCE,
      currency: 'INR',
    }, { onConflict: 'id' });
  }
  return id;
}

export async function executeBuy(
  userId: string,
  symbol: string,
  name: string,
  quantity: number,
  price: number,
  market: string
): Promise<{ success: boolean; message: string; transaction?: Transaction; position?: Position }> {
  const uid = await ensureUser(userId);
  const total = quantity * price;

  if (quantity <= 0) {
    return { success: false, message: 'Quantity must be positive' };
  }

  // Get current balance
  const { data: user } = await db.from('users').select('balance').eq('id', uid).single();
  if (!user || user.balance < total) {
    return { success: false, message: `Insufficient balance. Need ₹${total.toFixed(2)}, have ₹${(user?.balance || 0).toFixed(2)}` };
  }

  // Deduct balance
  await db.from('users').update({ balance: user.balance - total }).eq('id', uid);

  // Upsert position
  const { data: existing } = await db.from('positions').select('*').eq('user_id', uid).eq('symbol', symbol).single();
  let position: Position;

  if (existing) {
    const totalCost = existing.avg_price * existing.quantity + total;
    const newQty = existing.quantity + quantity;
    const newAvg = totalCost / newQty;
    await db.from('positions').update({
      quantity: newQty,
      avg_price: newAvg,
      invested_value: newAvg * newQty,
    }).eq('id', existing.id);
    position = { id: existing.id, userId: uid, symbol, name, quantity: newQty, avgBuyPrice: newAvg, market };
  } else {
    const { data: newPos } = await db.from('positions').insert({
      user_id: uid, symbol, name, quantity, avg_price: price, invested_value: total,
    }).select().single();
    position = { id: newPos!.id, userId: uid, symbol, name, quantity, avgBuyPrice: price, market };
  }

  // Record transaction
  const { data: txn } = await db.from('transactions').insert({
    user_id: uid, symbol, name, type: 'BUY', quantity, price, total,
  }).select().single();

  const transaction: Transaction = {
    id: txn!.id, userId: uid, symbol, name, type: 'BUY', quantity, price, total, market,
    timestamp: txn!.created_at,
  };

  return { success: true, message: `Bought ${quantity} ${symbol} at ₹${price.toFixed(2)}`, transaction, position };
}

export async function executeSell(
  userId: string,
  symbol: string,
  name: string,
  quantity: number,
  price: number,
  market: string
): Promise<{ success: boolean; message: string; transaction?: Transaction; position?: Position | null }> {
  const uid = await ensureUser(userId);

  if (quantity <= 0) {
    return { success: false, message: 'Quantity must be positive' };
  }

  const { data: existing } = await db.from('positions').select('*').eq('user_id', uid).eq('symbol', symbol).single();
  if (!existing || existing.quantity < quantity) {
    return { success: false, message: `Insufficient holdings. Have ${existing?.quantity || 0} shares of ${symbol}` };
  }

  const total = quantity * price;

  // Add balance
  const { data: user } = await db.from('users').select('balance').eq('id', uid).single();
  await db.from('users').update({ balance: (user?.balance || 0) + total }).eq('id', uid);

  // Update or remove position
  const newQty = existing.quantity - quantity;
  let resultPosition: Position | null = null;

  if (newQty === 0) {
    await db.from('positions').delete().eq('id', existing.id);
  } else {
    await db.from('positions').update({
      quantity: newQty,
      invested_value: existing.avg_price * newQty,
    }).eq('id', existing.id);
    resultPosition = { id: existing.id, userId: uid, symbol, name, quantity: newQty, avgBuyPrice: existing.avg_price, market };
  }

  // Record transaction
  const { data: txn } = await db.from('transactions').insert({
    user_id: uid, symbol, name, type: 'SELL', quantity, price, total,
  }).select().single();

  const transaction: Transaction = {
    id: txn!.id, userId: uid, symbol, name, type: 'SELL', quantity, price, total, market,
    timestamp: txn!.created_at,
  };

  return { success: true, message: `Sold ${quantity} ${symbol} at ₹${price.toFixed(2)}`, transaction, position: resultPosition };
}

export async function getPortfolio(userId: string) {
  const uid = await ensureUser(userId);

  const { data: user } = await db.from('users').select('balance').eq('id', uid).single();
  const { data: positions } = await db.from('positions').select('*').eq('user_id', uid).order('created_at', { ascending: false });
  const { data: transactions } = await db.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(50);

  return {
    balance: user?.balance || INITIAL_BALANCE,
    positions: (positions || []).map(p => ({
      id: p.id,
      userId: p.user_id,
      symbol: p.symbol,
      name: p.name || p.symbol,
      quantity: p.quantity,
      avgBuyPrice: p.avg_price,
      market: 'NSE',
    })) as Position[],
    transactions: (transactions || []).map(t => ({
      id: t.id,
      userId: t.user_id,
      symbol: t.symbol,
      name: t.name || t.symbol,
      type: t.type as 'BUY' | 'SELL',
      quantity: t.quantity,
      price: t.price,
      total: t.total,
      market: 'NSE',
      timestamp: t.created_at,
    })) as Transaction[],
  };
}

export async function getUserBalance(userId: string): Promise<number> {
  const uid = await ensureUser(userId);
  const { data } = await db.from('users').select('balance').eq('id', uid).single();
  return data?.balance || INITIAL_BALANCE;
}
