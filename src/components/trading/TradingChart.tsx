'use client';

import { useEffect, useRef, useState } from 'react';
import { useMarketStore } from '@/stores/market-store';
import type { CandleData } from '@/types';

const PERIODS = [
  { label: '1D', value: '1d', interval: '5m' },
  { label: '1W', value: '5d', interval: '15m' },
  { label: '1M', value: '1mo', interval: '1d' },
  { label: '3M', value: '3mo', interval: '1d' },
  { label: '1Y', value: '1y', interval: '1wk' },
  { label: '5Y', value: '5y', interval: '1wk' },
] as const;

export function TradingChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<{ remove: () => void } | null>(null);
  const activeSymbol = useMarketStore((s) => s.activeSymbol);
  const [activePeriod, setActivePeriod] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let destroyed = false;

    async function initChart() {
      const lc = await import('lightweight-charts');
      if (destroyed || !chartContainerRef.current) return;

      // Clean up previous chart
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
      }

      const chart = lc.createChart(chartContainerRef.current, {
        layout: {
          background: { type: lc.ColorType.Solid, color: 'transparent' },
          textColor: '#737373',
          fontFamily: 'inherit',
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.03)' },
          horzLines: { color: 'rgba(255,255,255,0.03)' },
        },
        crosshair: {
          mode: lc.CrosshairMode.Normal,
          vertLine: { color: 'rgba(255,255,255,0.1)', width: 1, style: 2 },
          horzLine: { color: 'rgba(255,255,255,0.1)', width: 1, style: 2 },
        },
        rightPriceScale: {
          borderColor: 'rgba(255,255,255,0.05)',
          scaleMargins: { top: 0.1, bottom: 0.2 },
        },
        timeScale: {
          borderColor: 'rgba(255,255,255,0.05)',
          timeVisible: true,
        },
        handleScroll: { vertTouchDrag: false },
      });

      chartInstanceRef.current = chart;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          chart.applyOptions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      });
      resizeObserver.observe(chartContainerRef.current);

      // Fetch and render data
      const period = PERIODS[activePeriod];
      setIsLoading(true);

      try {
        const res = await fetch(`/api/market/history?symbol=${activeSymbol}&period=${period.value}&interval=${period.interval}`);
        const data: CandleData[] = await res.json();

        if (destroyed || data.length === 0) {
          setIsLoading(false);
          return;
        }

        if (chartType === 'candle') {
          const series = chart.addSeries(lc.CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            wickUpColor: '#22c55e',
          });
          series.setData(data as Parameters<typeof series.setData>[0]);
        } else {
          const series = chart.addSeries(lc.AreaSeries, {
            lineColor: '#3b82f6',
            topColor: 'rgba(59,130,246,0.3)',
            bottomColor: 'rgba(59,130,246,0.01)',
            lineWidth: 2,
          });
          series.setData(
            data.map((d) => ({ time: d.time, value: d.close })) as Parameters<typeof series.setData>[0]
          );
        }

        // Volume
        const volumeSeries = chart.addSeries(lc.HistogramSeries, {
          priceFormat: { type: 'volume' },
          priceScaleId: 'volume',
        });
        chart.priceScale('volume').applyOptions({
          scaleMargins: { top: 0.85, bottom: 0 },
        });
        volumeSeries.setData(
          data
            .filter((d) => d.volume !== undefined)
            .map((d) => ({
              time: d.time,
              value: d.volume!,
              color: d.close >= d.open ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
            })) as Parameters<typeof volumeSeries.setData>[0]
        );

        chart.timeScale().fitContent();
      } catch {
        // chart data failed to load
      }
      setIsLoading(false);

      return () => {
        resizeObserver.disconnect();
      };
    }

    initChart();

    return () => {
      destroyed = true;
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [activeSymbol, activePeriod, chartType]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold">
            {activeSymbol.replace('.NS', '').replace('.BO', '')}
          </h2>
          <PriceDisplay symbol={activeSymbol} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setChartType('candle')}
            className={`px-2 py-0.5 text-xs rounded ${chartType === 'candle' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Candle
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-2 py-0.5 text-xs rounded ${chartType === 'line' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Line
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 relative">
        <div ref={chartContainerRef} className="absolute inset-0" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading chart...
            </div>
          </div>
        )}
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-t border-border">
        {PERIODS.map((period, i) => (
          <button
            key={period.label}
            onClick={() => setActivePeriod(i)}
            className={`px-2.5 py-0.5 text-xs rounded-md transition-colors ${
              i === activePeriod
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PriceDisplay({ symbol }: { symbol: string }) {
  const quote = useMarketStore((s) => s.prices[symbol]);

  if (!quote) return <span className="text-xs text-muted-foreground">Loading...</span>;

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold font-mono">
        {quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span className={`text-sm font-mono ${quote.changePercent >= 0 ? 'text-profit' : 'text-loss'}`}>
        {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%)
      </span>
    </div>
  );
}
