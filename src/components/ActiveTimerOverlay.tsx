import React, { useEffect, useState } from 'react';
import { TradeHistoryItem } from '../types/signal';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface ActiveTimerOverlayProps {
  activeTrade: TradeHistoryItem | null;
  currentPrice: number;
}

export const ActiveTimerOverlay: React.FC<ActiveTimerOverlayProps> = ({
  activeTrade,
  currentPrice,
}) => {
  if (!activeTrade) return null;

  const [secondsLeft, setSecondsLeft] = useState<number>(activeTrade.timerSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - activeTrade.timestamp) / 1000);
      const remaining = Math.max(0, activeTrade.timerSeconds - elapsedSeconds);
      setSecondsLeft(remaining);
    }, 200);

    return () => clearInterval(interval);
  }, [activeTrade]);

  const isCall = activeTrade.type === 'CALL';
  const isWinning = isCall ? currentPrice > activeTrade.entryPrice : currentPrice < activeTrade.entryPrice;
  const progressPercent = Math.min(100, Math.max(0, ((activeTrade.timerSeconds - secondsLeft) / activeTrade.timerSeconds) * 100));

  return (
    <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3 shadow-2xl shadow-indigo-500/10">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Clock size={16} className="text-indigo-400 animate-spin shrink-0" />
          <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-300">Active Trade Signal</span>
        </div>
        <span className="text-base sm:text-xl font-black font-mono text-indigo-400 animate-pulse shrink-0">{secondsLeft}s Remaining</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/10">
        <div
          className="bg-gradient-to-r from-teal-400 to-indigo-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
        <div className="bg-slate-950/80 p-2 rounded-xl border border-white/5">
          <div className="text-[9px] sm:text-[10px] text-slate-400">Pair & Direction</div>
          <div className={`text-xs font-bold font-mono ${isCall ? 'text-emerald-400' : 'text-rose-400'}`}>
            {activeTrade.symbol} ({activeTrade.type})
          </div>
        </div>

        <div className="bg-slate-950/80 p-2 rounded-xl border border-white/5">
          <div className="text-[9px] sm:text-[10px] text-slate-400">Entry Price</div>
          <div className="text-xs font-bold font-mono text-white">${activeTrade.entryPrice}</div>
        </div>

        <div className="bg-slate-950/80 p-2 rounded-xl border border-white/5">
          <div className="text-[9px] sm:text-[10px] text-slate-400">Live Price</div>
          <div className={`text-xs font-bold font-mono ${isWinning ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${currentPrice}
          </div>
        </div>

        <div className="bg-slate-950/80 p-2 rounded-xl border border-white/5">
          <div className="text-[9px] sm:text-[10px] text-slate-400">Status</div>
          <div className={`text-xs font-bold flex items-center justify-center gap-1 ${isWinning ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isWinning ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isWinning ? 'IN MONEY' : 'OUT MONEY'}
          </div>
        </div>
      </div>
    </div>
  );
};

