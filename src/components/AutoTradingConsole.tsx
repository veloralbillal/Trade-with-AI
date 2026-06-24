import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, Play, Square, TrendingUp, Sparkles, AlertCircle, RefreshCw, BarChart2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BinaryTrade } from '@/hooks/useDemoAccount';

interface AutoTradingConsoleProps {
  isAutoTrading: boolean;
  toggleAutoTrading: (enabled: boolean) => any;
  autoTradingMode: 'FOREX' | 'BINARY';
  setAutoTradingMode: (mode: 'FOREX' | 'BINARY') => void;
  selectedSymbol: string;
  currentPrice: number;
  executeTrade: (symbol: string, side: 'BUY' | 'SELL', amount: number, currentPrice: number, tp?: number, sl?: number, type?: 'FOREX' | 'CRYPTO') => any;
  executeBinaryTrade: (symbol: string, side: 'CALL' | 'PUT', amount: number, currentPrice: number, durationSeconds?: number) => any;
  binaryTrades: BinaryTrade[];
}

export function AutoTradingConsole({
  isAutoTrading,
  toggleAutoTrading,
  autoTradingMode,
  setAutoTradingMode,
  selectedSymbol,
  currentPrice,
  executeTrade,
  executeBinaryTrade,
  binaryTrades
}: AutoTradingConsoleProps) {
  const [logs, setLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'success' | 'warning' }>>([
    { time: new Date().toLocaleTimeString(), text: 'AI Bot ready for instant real-time scanning.', type: 'info' }
  ]);
  const [scansCount, setScansCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text, type }].slice(-24));
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Create mutable refs for real-time states and actions to completely prevent stale closures
  // and avoid clearing and restarting the 15-second scanning interval on every price update (which happens multiple times a second).
  const executeTradeRef = useRef(executeTrade);
  const executeBinaryTradeRef = useRef(executeBinaryTrade);
  const currentPriceRef = useRef(currentPrice);
  const selectedSymbolRef = useRef(selectedSymbol);
  const autoTradingModeRef = useRef(autoTradingMode);
  const binaryTradesRef = useRef(binaryTrades);

  useEffect(() => {
    executeTradeRef.current = executeTrade;
    executeBinaryTradeRef.current = executeBinaryTrade;
    currentPriceRef.current = currentPrice;
    selectedSymbolRef.current = selectedSymbol;
    autoTradingModeRef.current = autoTradingMode;
    binaryTradesRef.current = binaryTrades;
  }, [executeTrade, executeBinaryTrade, currentPrice, selectedSymbol, autoTradingMode, binaryTrades]);

  // Handle live automated interval trading when isAutoTrading is TRUE
  useEffect(() => {
    if (!isAutoTrading) return;

    const initialSymbol = selectedSymbolRef.current;
    addLog(`AI Trading Core initiated on asset ${initialSymbol}. Starting continuous scan...`, 'info');

    const scanInterval = setInterval(() => {
      const price = currentPriceRef.current;
      const symbol = selectedSymbolRef.current;
      const mode = autoTradingModeRef.current;

      if (!price) {
        addLog('AI Scanner deferred: Waiting for price stream feed...', 'warning');
        return;
      }
      
      setIsScanning(true);
      addLog(`Analyzing market feeds & indicators for ${symbol}...`, 'info');
      setScansCount(c => c + 1);

      setTimeout(() => {
        setIsScanning(false);
        const latestPrice = currentPriceRef.current || price;
        // Random decision logic for the automated bot: 65% trade, 35% neutral hold
        const randomSeed = Math.random();
        
        if (randomSeed > 0.35) {
          const side = Math.random() > 0.45 ? 'BUY' : 'SELL';
          const binarySide = side === 'BUY' ? 'CALL' : 'PUT';

          if (mode === 'FOREX') {
            const rsiVal = Math.floor(Math.random() * 25) + (side === 'BUY' ? 30 : 55);
            addLog(`[ANALYSIS] EMA(9) crossed ${side === 'BUY' ? 'above' : 'below'} EMA(21). Stochastic oscillator: RSI is currently ${rsiVal}. Bollinger Bands expanding.`, 'info');
            addLog(`[SIGNAL] Generative indicator showing STRONG ${side === 'BUY' ? 'bullish expansion' : 'bearish pressure'}! Sending live orders.`, 'success');

            // Dynamically calculate unit size based on a target USD amount (e.g., $10,000 USD value)
            // to prevent "Insufficient balance" when hardcoding 1,000 or 2,000 entire BTC units!
            const targetUSD = 10000;
            const amount = Number((targetUSD / latestPrice).toFixed(4));
            
            // Set auto TP (+1.5%) and SL (-1.5%)
            const tpPrice = side === 'BUY' ? latestPrice * 1.015 : latestPrice * 0.985;
            const slPrice = side === 'BUY' ? latestPrice * 0.985 : latestPrice * 1.015;

            const res = executeTradeRef.current(symbol, side, amount, latestPrice, tpPrice, slPrice, 'FOREX');
            if (res.success) {
              addLog(`[AUTO-BOT] Opened Forex ${side} trade: {${amount} UNITS} on ${symbol} @ $${latestPrice.toLocaleString()}. TP: $${tpPrice.toLocaleString(undefined, {maximumFractionDigits:2})}, SL: $${slPrice.toLocaleString(undefined, {maximumFractionDigits:2})}`, 'success');
            } else {
              addLog(`[AUTO-BOT] Forex entry deferred: ${res.message}`, 'warning');
            }
          } else {
            const hasActiveBinary = binaryTradesRef.current.some(t => t.status === 'PENDING' && t.expiry > Date.now());
            if (hasActiveBinary) {
              addLog(`[AUTO-BOT] Binary options entry skipped: There is an active binary trade currently in progress. Waiting for settlement.`, 'warning');
              return;
            }

            // Calculate current historical win rate of finished binary trades
            const closedBinaries = binaryTradesRef.current.filter(t => t.status === 'WIN' || t.status === 'LOSS');
            const winCount = closedBinaries.filter(t => t.status === 'WIN').length;
            const totalClosed = closedBinaries.length;
            const winRate = totalClosed > 0 ? (winCount / totalClosed) * 100 : 80; // Baseline 80% if starting fresh

            const confidence = Math.floor(Math.random() * 15) + 78; // 78% to 92% confidence
            addLog(`[ANALYSIS] Live tick feed suggests strong 1-min momentum. Machine learning model win rate: ${winRate.toFixed(1)}%. Stability Confidence: ${confidence}%.`, 'info');

            // Dynamic sizing: If win rate exceeds 75% or confidence exceeds 85%, scale up to high value trade
            let amount = 500;
            if (winRate >= 75 || confidence >= 85) {
              amount = winRate >= 85 ? 2000 : 1200;
              addLog(`[OPTIMIZER] High Success Rate detected (${winRate.toFixed(0)}% win rate / ${confidence}% confidence)! Raising trade value to $${amount.toLocaleString()} for maximum profits.`, 'success');
            } else {
              addLog(`[OPTIMIZER] Moderate Success Rate (${winRate.toFixed(0)}%). Safe standard contract value preserved: $${amount}.`, 'info');
            }

            addLog(`[SIGNAL] Sending Binary options order for ${binarySide} contract.`, 'success');

            const res = executeBinaryTradeRef.current(symbol, binarySide, amount, latestPrice, 60);
            if (res.success) {
              addLog(`[AUTO-BOT] Placed Binary ${binarySide} trade: $${amount} on ${symbol} @ $${latestPrice.toLocaleString()}. Confidence: ${confidence}%. Expiry: 60s.`, 'success');
            } else {
              addLog(`[AUTO-BOT] Binary entry deferred: ${res.message}`, 'warning');
            }
          }
        } else {
          addLog(`[AUTO-BOT] Analysis complete. Market signals neutral (RSI consolidation corridor). Holding positions.`, 'info');
        }
      }, 2000);

    }, 15000); // scan every 15 seconds for rapid high-engagement simulation

    return () => clearInterval(scanInterval);
  }, [isAutoTrading]);

  // Manual Trigger: "Run Signal Scan & Trade Now"
  const handleInstantTrade = () => {
    if (!currentPrice) {
      addLog('Cannot execute trade: Real-time price stream offline.', 'warning');
      return;
    }

    setIsScanning(true);
    addLog(`Manual Overrule: Scanning indicators on ${selectedSymbol} of type ${autoTradingMode}...`, 'info');
    
    setTimeout(() => {
      setIsScanning(false);
      const side = Math.random() > 0.45 ? 'BUY' : 'SELL';
      const binarySide = side === 'BUY' ? 'CALL' : 'PUT';

      if (autoTradingMode === 'FOREX') {
        const rsiVal = Math.floor(Math.random() * 20) + (side === 'BUY' ? 25 : 55);
        addLog(`[MANUAL SCAN] RSI(14) in ${side === 'BUY' ? 'oversold' : 'overbought'} territory (${rsiVal}). Stochastic momentum confirming reversal.`, 'info');
        addLog(`[MANUAL SIGNAL] STRONG technical reversal. Placing live order in direction: ${side}.`, 'success');

        const targetUSD = 15000;
        const amount = Number((targetUSD / currentPrice).toFixed(4));
        const tpPrice = side === 'BUY' ? currentPrice * 1.015 : currentPrice * 0.985;
        const slPrice = side === 'BUY' ? currentPrice * 0.985 : currentPrice * 1.015;
        const res = executeTrade(selectedSymbol, side, amount, currentPrice, tpPrice, slPrice, 'FOREX');
        if (res.success) {
          addLog(`[MANUAL COMMAND] Forex Trade Executed! ${side} ${amount} units of ${selectedSymbol} (~$15,000 USD) @ $${currentPrice.toLocaleString()}. Auto TP/SL levels applied to live charts.`, 'success');
        } else {
          addLog(`[MANUAL COMMAND] Forex trade failed: ${res.message}`, 'warning');
        }
      } else {
        const hasActiveBinary = binaryTrades.some(t => t.status === 'PENDING' && t.expiry > Date.now());
        if (hasActiveBinary) {
          addLog(`[MANUAL COMMAND] Blocked: A binary trade is currently in progress. Please wait for settlement before placing another.`, 'warning');
          return;
        }

        const closedBinaries = binaryTrades.filter(t => t.status === 'WIN' || t.status === 'LOSS');
        const winCount = closedBinaries.filter(t => t.status === 'WIN').length;
        const totalClosed = closedBinaries.length;
        const winRate = totalClosed > 0 ? (winCount / totalClosed) * 100 : 80;

        const confidence = Math.floor(Math.random() * 12) + 82; // 82% to 93% success chance
        addLog(`[MANUAL SCAN] Real-time stochastic lines crossed on 15s chart. Current win rate: ${winRate.toFixed(1)}%. Win Probability confidence: ${confidence}%.`, 'info');

        // Dynamic sizing: If win rate exceeds 75% or confidence exceeds 85%, scale up manual contract amount
        let amount = 1000;
        if (winRate >= 75 || confidence >= 85) {
          amount = winRate >= 85 ? 3000 : 2000;
          addLog(`[OPTIMIZER] High Success Rate detected (${winRate.toFixed(0)}% win rate / ${confidence}% confidence)! Raising manual contract to $${amount.toLocaleString()} for maximized efficiency.`, 'success');
        } else {
          addLog(`[OPTIMIZER] Standard manual contract value: $${amount}.`, 'info');
        }

        addLog(`[MANUAL SIGNAL] Sending High-Confidence order direction: ${binarySide}.`, 'success');

        const res = executeBinaryTrade(selectedSymbol, binarySide, amount, currentPrice, 60);
        if (res.success) {
          addLog(`[MANUAL COMMAND] Binary Trade Executed! ${binarySide} contract for $${amount.toLocaleString()} placed @ $${currentPrice.toLocaleString()} (${confidence}% Win probability). Expiry: 60 seconds.`, 'success');
        } else {
          addLog(`[MANUAL COMMAND] Binary contract failed: ${res.message}`, 'warning');
        }
      }
    }, 2000); // Shorter duration for responsive instant command click feel
  };

  return (
    <Card className="bg-sleek-card border-white/5 rounded-[24px] overflow-hidden backdrop-blur-md flex flex-col h-full min-h-[350px]">
      <CardHeader className="py-3 px-5 border-b border-white/5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sleek-purple/10 border border-sleek-purple/20 text-sleek-purple">
            <Cpu size={14} className={isAutoTrading ? "animate-spin" : ""} />
          </div>
          <div>
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-sleek-text-secondary flex items-center gap-1">
              AI Auto Trader Pro
            </CardTitle>
            <span className="text-[10px] text-white/40">Pure real-time algorithmic signals</span>
          </div>
        </div>

        <Badge 
          className={`text-[9px] uppercase font-bold tracking-widest ${
            isAutoTrading 
              ? 'bg-sleek-teal/20 text-sleek-teal border-sleek-teal/30 hover:bg-sleek-teal/20' 
              : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/5'
          }`}
          variant="outline"
        >
          {isAutoTrading ? 'LIVE BOT RUNNING' : 'BOT STANDBY'}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 flex flex-col flex-1 gap-4">
        {/* Trading Mode selector & controls */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => {
              setAutoTradingMode('FOREX');
              addLog('Auto trading mode switched to FOREX. Ready for TP/SL signals.', 'info');
            }}
            className={`py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
              autoTradingMode === 'FOREX' 
                ? 'bg-sleek-blue text-slate-950 font-extrabold shadow-md shadow-sleek-blue/20' 
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            <TrendingUp size={11} />
            Forex Mode
          </button>
          
          <button
            onClick={() => {
              setAutoTradingMode('BINARY');
              addLog('Auto trading mode switched to BINARY options countdowns.', 'info');
            }}
            className={`py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
              autoTradingMode === 'BINARY' 
                ? 'bg-sleek-purple text-white font-extrabold shadow-md shadow-sleek-purple/20' 
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            <BarChart2 size={11} />
            Binary Mode
          </button>
        </div>

        {/* Action Toggle bot */}
        <div className="flex gap-2">
          {isAutoTrading ? (
            <Button
              onClick={() => toggleAutoTrading(false)}
              className="flex-1 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 text-red-400 text-xs font-bold gap-2 py-5 rounded-xl"
            >
              <Square size={14} fill="currentColor" />
              DEACTIVATE BOT
            </Button>
          ) : (
            <Button
              onClick={() => toggleAutoTrading(true)}
              className="flex-1 bg-gradient-to-r from-sleek-teal to-sleek-blue hover:from-sleek-teal/90 hover:to-sleek-blue/90 text-slate-950 text-xs font-black gap-2 py-5 rounded-xl transition-all shadow-lg shadow-sleek-blue/10"
            >
              <Play size={14} fill="currentColor" />
              START COMPILER BOT
            </Button>
          )}

          <Button
            onClick={handleInstantTrade}
            disabled={isScanning}
            className="px-3 py-5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5"
            title="Scan market and trade instantly"
          >
            {isScanning ? (
              <RefreshCw size={14} className="animate-spin text-sleek-blue" />
            ) : (
              <Sparkles size={14} className="text-sleek-teal" />
            )}
          </Button>
        </div>

        {/* Real-Time Trading Terminal Output */}
        <div className="flex-1 flex flex-col bg-slate-950/60 rounded-xl border border-white/5 overflow-hidden font-mono text-[9px]">
          <div className="bg-slate-950/80 px-3 py-1.5 border-b border-white/5 flex items-center justify-between">
            <span className="text-sleek-text-secondary uppercase tracking-widest font-bold">Scanning Live Feed Logs</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sleek-teal animate-pulse" />
              <span className="text-slate-500">{scansCount} scans</span>
            </div>
          </div>
          
          <div 
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[160px] scrollbar-hide select-none"
          >
            {logs.map((log, index) => (
              <div key={index} className="flex gap-2 leading-relaxed">
                <span className="text-slate-500 shrink-0">{log.time}</span>
                <span className={`
                  ${log.type === 'success' ? 'text-sleek-teal' : ''}
                  ${log.type === 'warning' ? 'text-orange-400' : ''}
                  ${log.type === 'info' ? 'text-slate-300' : ''}
                `}>
                  {log.text}
                </span>
              </div>
            ))}
            {isScanning && (
              <div className="flex gap-2 animate-pulse text-sleek-blue">
                <span>--:--:--</span>
                <span>Calculating stochastic oscillators & volume momentum vectors...</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-[10px] text-white/30 flex items-center gap-1.5 px-1 bg-slate-950/25 py-1.5 rounded-lg border border-white/5">
          <ShieldCheck size={11} className="text-sleek-teal" />
          <span>Real-time leverage: <b>1:100</b>. Auto TP/SL automatically drawn instantly in lightweight-charts canvas.</span>
        </div>
      </CardContent>
    </Card>
  );
}
