'use client';

import { useUIStore } from '@/stores/ui-store';
import { usePortfolioStore } from '@/stores/portfolio-store';
import { formatCurrency } from '@/lib/format';
import { Search, BarChart3, Briefcase, Trophy, Settings, Menu, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Trade', icon: BarChart3 },
  { href: '/markets', label: 'Markets', icon: BarChart3 },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export function Header() {
  const pathname = usePathname();
  const setCommandOpen = useUIStore((s) => s.setCommandOpen);
  const user = usePortfolioStore((s) => s.user);

  return (
    <header className="h-12 border-b border-border bg-card/50 backdrop-blur-md flex items-center px-4 gap-4 shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-sm hidden sm:block">TradeSimPro</span>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-1 ml-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Search */}
      <button
        onClick={() => setCommandOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 border border-border text-muted-foreground hover:text-foreground transition-colors ml-auto"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs hidden sm:block">Search stocks...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">
          Ctrl+K
        </kbd>
      </button>

      {/* Balance */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/30 border border-border">
        <Wallet className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-mono font-medium">
          {formatCurrency(user?.virtualBalance || 1000000)}
        </span>
      </div>

      {/* User */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
          {user?.name?.charAt(0) || 'D'}
        </div>
      </div>
    </header>
  );
}
