'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { TickerTape } from '@/components/trading/TickerTape';
import { Watchlist } from '@/components/trading/Watchlist';
import { TradingChart } from '@/components/trading/TradingChart';
import { OrderPanel } from '@/components/trading/OrderPanel';
import { PositionsTable } from '@/components/trading/PositionsTable';
import { TradeHistory } from '@/components/trading/TradeHistory';
import { Header } from '@/components/layout/Header';
import { useState } from 'react';

export default function DashboardPage() {
  const [bottomTab, setBottomTab] = useState<'positions' | 'history'>('positions');

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <TickerTape />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Watchlist */}
          <ResizablePanel defaultSize={18} minSize={14} maxSize={25}>
            <div className="h-full border-r border-border bg-card/30">
              <Watchlist />
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-px bg-border hover:bg-primary/50 transition-colors" />

          {/* Main Area */}
          <ResizablePanel defaultSize={58} minSize={40}>
            <ResizablePanelGroup direction="vertical">
              {/* Chart */}
              <ResizablePanel defaultSize={65} minSize={40}>
                <div className="h-full bg-card/20">
                  <TradingChart />
                </div>
              </ResizablePanel>

              <ResizableHandle className="h-px bg-border hover:bg-primary/50 transition-colors" />

              {/* Bottom Panel */}
              <ResizablePanel defaultSize={35} minSize={15}>
                <div className="h-full bg-card/30 flex flex-col">
                  <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border">
                    <button
                      onClick={() => setBottomTab('positions')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        bottomTab === 'positions'
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Positions
                    </button>
                    <button
                      onClick={() => setBottomTab('history')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        bottomTab === 'history'
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Trade History
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {bottomTab === 'positions' ? <PositionsTable /> : <TradeHistory />}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle className="w-px bg-border hover:bg-primary/50 transition-colors" />

          {/* Order Panel */}
          <ResizablePanel defaultSize={24} minSize={18} maxSize={30}>
            <div className="h-full border-l border-border bg-card/30">
              <OrderPanel />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
