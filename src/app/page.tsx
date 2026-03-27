'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Shield, Zap, Globe, ArrowRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MarketIndex } from '@/types';

const FEATURES = [
  { icon: Activity, title: 'Live Market Data', desc: 'Real-time prices from NSE, NYSE, NASDAQ, and crypto markets' },
  { icon: Shield, title: 'Zero Risk', desc: 'Start with ₹10,00,000 virtual cash. Learn without losing real money' },
  { icon: Zap, title: 'Instant Execution', desc: 'Buy and sell stocks instantly at market price' },
  { icon: Globe, title: 'Global Markets', desc: 'Trade NIFTY, SENSEX, S&P 500, NASDAQ, Crypto and more' },
  { icon: BarChart3, title: 'Pro Charts', desc: 'TradingView-powered candlestick charts with volume data' },
  { icon: TrendingUp, title: 'Track Performance', desc: 'Real-time P&L, portfolio analytics, and trade history' },
];

export default function LandingPage() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);

  useEffect(() => {
    fetch('/api/market/indices')
      .then(res => res.json())
      .then(data => setIndices(data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md bg-background/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">TradeSimPro</span>
          </div>
          <Link href="/dashboard">
            <Button size="sm" className="gap-1">
              Start Trading <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Live Ticker */}
      {indices.length > 0 && (
        <div className="border-b border-border/50 bg-card/30 overflow-hidden">
          <div className="ticker-animate flex items-center h-8 whitespace-nowrap">
            {[...indices, ...indices].map((idx, i) => (
              <div key={`${idx.symbol}-${i}`} className="inline-flex items-center gap-2 px-4 text-xs">
                <span className="font-medium">{idx.shortName}</span>
                <span className="text-foreground/80">{idx.price.toLocaleString()}</span>
                <span className={idx.changePercent >= 0 ? 'text-profit' : 'text-loss'}>
                  {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
                </span>
                <span className="text-border">|</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <Activity className="w-3 h-3" />
            Free Virtual Trading Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Master Trading
            <br />
            <span className="text-primary">Without The Risk</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Practice stock trading with ₹10,00,000 virtual cash. Real market data from Indian, US, and global exchanges.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base px-8">
                <BarChart3 className="w-4 h-4" />
                Start Trading Now
              </Button>
            </Link>
            <Link href="/markets">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base px-8">
                <Globe className="w-4 h-4" />
                Explore Markets
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto"
        >
          {[
            { label: 'Markets', value: '10+' },
            { label: 'Stocks', value: '50,000+' },
            { label: 'Virtual Cash', value: '₹10L' },
            { label: 'Cost', value: 'FREE' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">
          Everything you need to practice trading
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="p-5 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
            >
              <feature.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20">
          <h2 className="text-2xl font-bold mb-2">Ready to start trading?</h2>
          <p className="text-muted-foreground mb-6">No sign-up required. Jump straight into trading.</p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Open Trading Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        <p>TradeSimPro — Virtual Trading Simulator. Not financial advice. Market data may be delayed.</p>
      </footer>
    </div>
  );
}
