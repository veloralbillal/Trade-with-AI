import React, { useState } from 'react';
import { useCryptoData } from './hooks/useCryptoData';
import { useDemoAccount } from './hooks/useDemoAccount';
import { CryptoChart } from './components/CryptoChart';
import { MarketOverview } from './components/MarketOverview';
import { VoiceInterface } from './components/VoiceInterface';
import { Portfolio } from './components/Portfolio';
import { AutoTradingConsole } from './components/AutoTradingConsole';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Globe, Zap, Shield } from 'lucide-react';

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1m');
  const { prices, history, loadMoreHistory, isLoadingMore } = useCryptoData(undefined, interval);
  const { 
    balance, 
    positions, 
    binaryTrades,
    trades, 
    executeTrade, 
    executeBinaryTrade,
    closePosition,
    isAutoTrading, 
    toggleAutoTrading, 
    adjustBalance,
    autoTradingMode,
    setAutoTradingMode,
    checkTP_SL
  } = useDemoAccount();
  const apiKey = process.env.GEMINI_API_KEY || '';

  // Trigger real-time checking of TP/SL limits when live stream prices update
  React.useEffect(() => {
    checkTP_SL(prices);
  }, [prices, checkTP_SL]);

  const currentCrypto = prices[selectedSymbol];
  const currentHistory = history[selectedSymbol] || [];

  const intervals = ['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1d'];

  return (
    <div className="min-h-screen bg-sleek-bg text-sleek-text-primary font-sans selection:bg-sleek-blue/30 flex flex-col">
      {/* Navigation Bar */}
      <nav className="h-16 px-8 flex items-center justify-between bg-slate-950/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="text-xl font-bold tracking-tighter bg-gradient-to-r from-sleek-blue to-sleek-purple bg-clip-text text-transparent">
          GEMINI.AI
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-xs">
          {['BTC', 'ETH', 'SOL'].map((sym) => {
            const data = prices[`${sym}USDT`];
            return (
              <div key={sym} className="flex items-center gap-2">
                <span className="text-sleek-text-secondary font-medium">{sym}</span>
                <span className="font-semibold">${data?.price.toLocaleString() || '---'}</span>
                <span className={data?.change >= 0 ? 'text-sleek-up' : 'text-sleek-down'}>
                  {data?.change >= 0 ? '+' : ''}{data?.change.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {isAutoTrading && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sleek-teal/10 border border-sleek-teal/20 text-[10px] font-bold text-sleek-teal uppercase tracking-wider animate-pulse">
              <Activity size={12} />
              Auto Trading
            </div>
          )}
          <div className="px-3 py-1 rounded-full bg-sleek-blue/10 border border-sleek-blue/20 text-[10px] font-bold text-sleek-blue uppercase tracking-wider">
            Demo: ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-sleek-text-secondary uppercase tracking-widest font-medium">
            Live Prod
          </div>
        </div>
      </nav>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 p-3 md:p-6 overflow-hidden">
        {/* Left Panel: Gemini Voice & Markets */}
        <div className="order-2 lg:order-1 flex flex-col gap-6 lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto scrollbar-hide">
          <VoiceInterface 
            apiKey={apiKey} 
            onTrade={async (symbol, side, amount) => {
              const price = prices[symbol]?.price;
              if (!price) return { success: false, message: 'Price not found' };
              return executeTrade(symbol, side, amount, price);
            }}
            getAccountInfo={() => ({
              balance,
              positions: positions.map(p => ({
                ...p,
                currentValue: p.amount * (prices[p.symbol]?.price || p.entryPrice)
              }))
            })}
            onToggleAutoTrading={toggleAutoTrading}
            onAdjustBalance={adjustBalance}
            onForexTrade={async (symbol, side, amount, tp, sl) => {
              const price = prices[symbol]?.price;
              if (!price) return { success: false, message: 'Price not found' };
              return executeTrade(symbol, side, amount, price, tp, sl, 'FOREX');
            }}
            onBinaryTrade={async (symbol, side, amount, duration) => {
              const price = prices[symbol]?.price;
              if (!price) return { success: false, message: 'Price not found' };
              return executeBinaryTrade(symbol, side, amount, price, duration);
            }}
            getMarketData={(symbol) => {
              const symbolHistory = history[symbol] || [];
              // Return the last 30 candles for analysis
              return symbolHistory.slice(-30).map(c => ({
                t: new Date(c.time * 1000).toLocaleTimeString(),
                o: c.open,
                h: c.high,
                l: c.low,
                c: c.close
              }));
            }}
          />

          <MarketOverview 
            prices={prices} 
            selectedSymbol={selectedSymbol} 
            onSelect={setSelectedSymbol} 
          />
        </div>

        {/* Right Panel: Market, Chart, Portfolio, and Auto Trading Console */}
        <div className="order-1 lg:order-2 flex flex-col gap-6 lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto scrollbar-hide pb-8">
          {/* Asset Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 px-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-1 bg-gradient-to-r from-sleek-blue to-white bg-clip-text text-transparent">
                {selectedSymbol.replace('USDT', '')} / USD
              </h2>
              <div className="flex flex-wrap gap-4 text-xs md:text-sm text-sleek-text-secondary">
                <span>Vol 24h: ${currentCrypto?.volume.toLocaleString() || '---'}</span>
                <span>High: ${currentCrypto?.high.toLocaleString() || '---'}</span>
                <span>Low: ${currentCrypto?.low.toLocaleString() || '---'}</span>
              </div>
            </div>
            
            {/* Timeframe Selector & Pricing */}
            <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
              <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/5 overflow-x-auto scrollbar-hide max-w-full">
                {intervals.map((int) => (
                  <button
                    key={int}
                    onClick={() => setInterval(int)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all shrink-0 ${
                      interval === int 
                        ? 'bg-sleek-blue text-slate-950 shadow-lg shadow-sleek-blue/20 font-black' 
                        : 'text-sleek-text-secondary hover:text-sleek-text-primary'
                    }`}
                  >
                    {int}
                  </button>
                ))}
              </div>
              <div className="sm:text-right">
                <div className={`text-2xl md:text-3xl font-bold font-mono leading-none ${currentCrypto?.change >= 0 ? 'text-sleek-up' : 'text-sleek-down'}`}>
                  ${currentCrypto?.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '---'}
                </div>
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="min-h-[400px]">
            <CryptoChart 
              data={currentHistory} 
              symbol={selectedSymbol} 
              color={currentCrypto?.change >= 0 ? "#2dd4bf" : "#f87171"}
              onLoadMore={() => loadMoreHistory(selectedSymbol)}
              isLoadingMore={isLoadingMore}
              positions={positions}
              binaryTrades={binaryTrades}
              trades={trades}
            />
          </div>

          {/* Demo Portfolio - Directly above the AutoTradingConsole */}
          <div className="w-full">
            <Portfolio 
              balance={balance} 
              positions={positions} 
              trades={trades} 
              binaryTrades={binaryTrades} 
              prices={prices}
              onClosePosition={closePosition}
            />
          </div>

          {/* AI Auto Trader Pro - Directly under the Chart (and below Demo Portfolio) */}
          <div className="w-full">
            <AutoTradingConsole
              isAutoTrading={isAutoTrading}
              toggleAutoTrading={toggleAutoTrading}
              autoTradingMode={autoTradingMode}
              setAutoTradingMode={setAutoTradingMode}
              selectedSymbol={selectedSymbol}
              currentPrice={currentCrypto?.price || 0}
              executeTrade={executeTrade}
              executeBinaryTrade={executeBinaryTrade}
              binaryTrades={binaryTrades}
            />
          </div>
        </div>
      </main>

      {/* Action Bar */}
      <div className="h-20 px-8 flex items-center justify-center gap-4 border-t border-white/5 bg-slate-950/50">
        <span className="hidden sm:inline text-sm text-sleek-text-secondary italic">
          Try "Buy 0.1 BTC" or "What is my balance?"
        </span>
        <div className="text-xs text-sleek-text-secondary font-medium uppercase tracking-widest">
          Voice Trading Active
        </div>
      </div>
    </div>
  );
}
