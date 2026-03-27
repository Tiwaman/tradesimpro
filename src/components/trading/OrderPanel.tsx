'use client';

import { useState, useCallback } from 'react';
import { useMarketStore } from '@/stores/market-store';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/format';
import { toast } from 'sonner';
import { ShoppingCart, TrendingDown } from 'lucide-react';

export function OrderPanel() {
  const activeSymbol = useMarketStore((s) => s.activeSymbol);
  const quote = useMarketStore((s) => s.prices[activeSymbol]);
  const user = usePortfolioStore((s) => s.user);

  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const price = quote?.price || 0;
  const total = parseInt(quantity || '0') * price;
  const currency = quote?.currency || 'INR';

  const handleTrade = useCallback(async () => {
    if (!quote || !quantity || parseInt(quantity) <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/trade/${orderType.toLowerCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'demo-user',
          symbol: activeSymbol,
          name: quote.name,
          quantity: parseInt(quantity),
          price: quote.price,
          market: quote.market,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(result.message, {
          description: `Total: ${formatCurrency(total, currency)}`,
        });
        setQuantity('1');
        // Refresh portfolio
        const portfolioRes = await fetch(`/api/trade/portfolio?userId=${user?.id || 'demo-user'}`);
        if (portfolioRes.ok) {
          const portfolio = await portfolioRes.json();
          usePortfolioStore.getState().setPositions(portfolio.positions);
          usePortfolioStore.getState().setTransactions(portfolio.transactions);
          if (user) {
            usePortfolioStore.getState().setUser({ ...user, virtualBalance: portfolio.balance });
          }
        }
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Trade failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [quote, quantity, orderType, activeSymbol, user, total, currency]);

  const quickQuantities = [1, 5, 10, 25, 50, 100];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Place Order
        </h3>
      </div>

      <div className="flex-1 p-3 space-y-4">
        {/* Buy/Sell Toggle */}
        <div className="flex rounded-lg overflow-hidden border border-border">
          <button
            onClick={() => setOrderType('BUY')}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              orderType === 'BUY'
                ? 'bg-profit text-white'
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            BUY
          </button>
          <button
            onClick={() => setOrderType('SELL')}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              orderType === 'SELL'
                ? 'bg-loss text-white'
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            SELL
          </button>
        </div>

        {/* Symbol & Price */}
        <div className="space-y-1">
          <div className="text-sm font-semibold">
            {activeSymbol.replace('.NS', '').replace('.BO', '')}
          </div>
          <div className="text-2xl font-bold font-mono">
            {price > 0 ? formatCurrency(price, currency) : '--'}
          </div>
          {quote && (
            <div className={`text-xs font-mono ${quote.changePercent >= 0 ? 'text-profit' : 'text-loss'}`}>
              {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
            </div>
          )}
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quantity</Label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="font-mono bg-secondary border-border"
          />
          <div className="flex flex-wrap gap-1">
            {quickQuantities.map((q) => (
              <button
                key={q}
                onClick={() => setQuantity(q.toString())}
                className="px-2 py-0.5 text-[10px] rounded bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Price</Label>
          <div className="px-3 py-2 rounded-md bg-secondary text-sm font-mono border border-border">
            Market Price
          </div>
        </div>

        {/* Total */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Estimated Total</span>
            <span>{parseInt(quantity || '0')} x {formatCurrency(price, currency)}</span>
          </div>
          <div className="text-lg font-bold font-mono">
            {formatCurrency(total, currency)}
          </div>
        </div>

        {/* Balance */}
        <div className="text-xs text-muted-foreground">
          Available: <span className="text-foreground font-mono">{formatCurrency(user?.virtualBalance || 1000000)}</span>
        </div>

        {/* Submit */}
        <Button
          onClick={handleTrade}
          disabled={isSubmitting || price === 0}
          className={`w-full font-semibold ${
            orderType === 'BUY'
              ? 'bg-profit hover:bg-profit/90 text-white'
              : 'bg-loss hover:bg-loss/90 text-white'
          }`}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {orderType === 'BUY' ? <ShoppingCart className="w-4 h-4 mr-2" /> : <TrendingDown className="w-4 h-4 mr-2" />}
              {orderType} {activeSymbol.replace('.NS', '').replace('.BO', '')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
