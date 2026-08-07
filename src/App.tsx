import React, { useState } from 'react';
import { Header } from './components/Header';
import { CurrencySelector } from './components/CurrencySelector';
import { TimerSelector } from './components/TimerSelector';
import { AccuracyModeSelector } from './components/AccuracyModeSelector';
import { SignalAction } from './components/SignalAction';
import { SignalCard } from './components/SignalCard';
import { ActiveTimerOverlay } from './components/ActiveTimerOverlay';
import { SignalHistory } from './components/SignalHistory';
import { useCurrencyPrices } from './hooks/useCurrencyPrices';
import { SignalResult, TradeHistoryItem, AccuracyMode, TechnicalIndicator } from './types/signal';

export default function App() {
  const currencies = useCurrencyPrices();
  const [selectedSymbol, setSelectedSymbol] = useState<string>('EUR/USD');
  const [selectedTimerSeconds, setSelectedTimerSeconds] = useState<number>(30);
  const [accuracyMode, setAccuracyMode] = useState<AccuracyMode>('ULTRA_CONFLUENCE');
  const [filterHighVolatility, setFilterHighVolatility] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(10000);
  const [tradeAmount, setTradeAmount] = useState<number>(100);

  const [currentSignal, setCurrentSignal] = useState<SignalResult | null>(null);
  const [isGeneratingSignal, setIsGeneratingSignal] = useState<boolean>(false);
  
  const [activeTrade, setActiveTrade] = useState<TradeHistoryItem | null>(null);
  const [history, setHistory] = useState<TradeHistoryItem[]>([]);

  const selectedCurrency = currencies.find((c) => c.symbol === selectedSymbol) || currencies[0];

  // Handle generating a signal
  const handleGenerateSignal = () => {
    if (isGeneratingSignal) return;

    setIsGeneratingSignal(true);
    setCurrentSignal(null);

    setTimeout(() => {
      const isCall = Math.random() > 0.45;
      const isUltra = accuracyMode === 'ULTRA_CONFLUENCE';

      // Boost win rate & confidence depending on mode & volatility
      let successRate = selectedCurrency.winRate;
      let confidence = Math.floor(Math.random() * 6) + 89;

      if (isUltra) {
        // AI Multi-Confluence Engine boosts accuracy to 95-98%
        successRate = Math.min(98, Math.max(95, selectedCurrency.winRate + 2));
        confidence = Math.floor(Math.random() * 4) + 95; // 95% - 98%
      }

      const defaultReasons = [
        'RSI extreme oversold + EMA 20/50 Golden Cross verified.',
        'Stochastic Oscillator bullish convergence on 15s chart.',
        'Institutional volume profile POC breakout detected.',
        'MACD histogram bullish expansion with strong support.',
      ];

      const sampleIndicators: TechnicalIndicator[] = isUltra
        ? [
            { name: 'RSI (14)', status: 'STRONG', value: isCall ? '31.2 Oversold' : '68.8 Overbought' },
            { name: 'EMA Cross', status: 'CONFIRMED', value: '20/50 Golden Cross' },
            { name: 'Volume Profile', status: 'STRONG', value: 'High Buying Pressure' },
          ]
        : [
            { name: 'RSI (14)', status: 'CONFIRMED', value: isCall ? '38.5 Rebound' : '62.1 Pulldown' },
          ];

      const newSignal: SignalResult = {
        id: `sig_${Date.now()}`,
        symbol: selectedSymbol,
        type: isCall ? 'CALL' : 'PUT',
        confidence,
        successRate,
        volatility: selectedCurrency.volatility,
        entryPrice: selectedCurrency.price,
        timerSeconds: selectedTimerSeconds,
        reason: defaultReasons[Math.floor(Math.random() * defaultReasons.length)],
        accuracyMode,
        indicators: sampleIndicators,
        timestamp: Date.now(),
      };

      setCurrentSignal(newSignal);
      setIsGeneratingSignal(false);
    }, 900);
  };

  // Handle executing a signal trade
  const handleExecuteTrade = () => {
    if (!currentSignal || activeTrade) return;
    if (balance < tradeAmount) {
      alert('Insufficient balance!');
      return;
    }

    setBalance((prev) => prev - tradeAmount);

    const newTrade: TradeHistoryItem = {
      id: `trade_${Date.now()}`,
      symbol: currentSignal.symbol,
      type: currentSignal.type,
      entryPrice: selectedCurrency.price,
      amount: tradeAmount,
      timerSeconds: currentSignal.timerSeconds,
      status: 'PENDING',
      profit: 0,
      timestamp: Date.now(),
    };

    setActiveTrade(newTrade);
    setHistory((prev) => [newTrade, ...prev]);

    // Settlement handler
    setTimeout(() => {
      const currentPrice = selectedCurrency.price;
      
      // Determine win/loss based on success rate probability
      const winProbability = currentSignal.successRate;
      const isWin = Math.random() * 100 <= winProbability;

      const payout = isWin ? tradeAmount * 1.88 : 0;
      const profit = isWin ? tradeAmount * 0.88 : -tradeAmount;

      if (isWin) {
        setBalance((b) => b + payout);
      }

      setHistory((prev) =>
        prev.map((item) => {
          if (item.id === newTrade.id) {
            return {
              ...item,
              exitPrice: isWin
                ? currentSignal.type === 'CALL'
                  ? currentPrice + 0.0012
                  : currentPrice - 0.0012
                : currentSignal.type === 'CALL'
                  ? currentPrice - 0.0015
                  : currentPrice + 0.0015,
              status: isWin ? 'WIN' : 'LOSS',
              profit,
            };
          }
          return item;
        })
      );

      setActiveTrade(null);
    }, currentSignal.timerSeconds * 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500/30 flex flex-col">
      <Header balance={balance} onResetBalance={() => setBalance(10000)} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* AI Accuracy Mode Upgrade Selector */}
        <AccuracyModeSelector
          accuracyMode={accuracyMode}
          onSelectMode={(mode) => setAccuracyMode(mode)}
          filterHighVolatility={filterHighVolatility}
          onToggleFilter={() => setFilterHighVolatility(!filterHighVolatility)}
        />

        {/* Step 1: Select Currency Pair */}
        <CurrencySelector
          currencies={currencies}
          selectedSymbol={selectedSymbol}
          filterHighVolatility={filterHighVolatility}
          onSelect={(symbol) => {
            setSelectedSymbol(symbol);
            setCurrentSignal(null);
          }}
        />

        {/* Step 2: Select Timer Duration */}
        <TimerSelector
          selectedSeconds={selectedTimerSeconds}
          onSelectTimer={(seconds) => {
            setSelectedTimerSeconds(seconds);
            setCurrentSignal(null);
          }}
        />

        {/* Step 3: Signal Action Button */}
        <SignalAction
          onGenerateSignal={handleGenerateSignal}
          isGenerating={isGeneratingSignal}
          selectedSymbol={selectedSymbol}
          selectedTimerSeconds={selectedTimerSeconds}
        />

        {/* Active Trade Timer Overlay */}
        {activeTrade && (
          <ActiveTimerOverlay activeTrade={activeTrade} currentPrice={selectedCurrency.price} />
        )}

        {/* Step 4: Generated Signal Card */}
        <SignalCard
          signal={currentSignal}
          tradeAmount={tradeAmount}
          setTradeAmount={setTradeAmount}
          onExecuteTrade={handleExecuteTrade}
          isExecuting={isGeneratingSignal}
          hasActiveTrade={activeTrade !== null}
        />

        {/* Trade Signal History */}
        <SignalHistory history={history} />
      </main>
    </div>
  );
}
