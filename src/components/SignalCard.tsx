import React from 'react';
import { SignalResult } from '../types/signal';
import { IndicatorBadges } from './IndicatorBadges';
import { TrendingUp, TrendingDown, Zap, Clock, ShieldCheck, DollarSign, Activity, Sparkles } from 'lucide-react';

interface SignalCardProps {
  signal: SignalResult | null;
  tradeAmount: number;
  setTradeAmount: (val: number) => void;
  onExecuteTrade: () => void;
  isExecuting: boolean;
  hasActiveTrade: boolean;
}

export const SignalCard: React.FC<SignalCardProps> = ({
  signal,
  tradeAmount,
  setTradeAmount,
  onExecuteTrade,
  isExecuting,
  hasActiveTrade,
}) => {
  if (!signal) {
    return (
      <div className="bg-slate-900/40 border border-dashed border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-2">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
          <Zap size={22} />
        </div>
        <p className="text-sm font-semibold text-slate-400">No Active Signal</p>
        <p className="text-xs text-slate-500 max-w-xs">
          Select currency pair and timer duration, then click "GENERATE SIGNAL" above.
        </p>
      </div>
    );
  }

  const isCall = signal.type === 'CALL';
  const isLowMod = signal.volatility === 'Low' || signal.volatility === 'Moderate';
  const isUltra = signal.accuracyMode === 'ULTRA_CONFLUENCE';

  return (
    <div className={`border rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3.5 backdrop-blur-md transition-all shadow-2xl ${
      isCall 
        ? 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border-emerald-500/40 shadow-emerald-500/10' 
        : 'bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-950 border-rose-500/40 shadow-rose-500/10'
    }`}>
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400">Signal:</span>
          <span className="text-xs sm:text-sm font-black text-white font-mono">{signal.symbol}</span>
          {isUltra && (
            <span className="text-[9px] sm:text-[10px] font-black bg-teal-400 text-slate-950 px-2 py-0.5 rounded flex items-center gap-1">
              <Sparkles size={11} /> ULTRA 98% WIN
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
            isLowMod
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}>
            <Activity size={12} />
            {signal.volatility} Vol. ({isLowMod ? 'RECOMMENDED' : 'CAUTION'})
          </span>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/80 border border-white/10 text-[10px] sm:text-xs font-bold text-slate-300">
            <Clock size={12} className="text-indigo-400" />
            <span>{signal.timerSeconds}s</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${
            isCall ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-500 shadow-rose-500/30'
          }`}>
            {isCall ? <TrendingUp size={26} /> : <TrendingDown size={26} />}
          </div>
          <div>
            <div className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${isCall ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isCall ? 'BUY / CALL ⬆' : 'SELL / PUT ⬇'}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span>Entry: <strong className="text-white font-mono">${signal.entryPrice}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-teal-400 font-bold">
                <ShieldCheck size={13} /> {signal.successRate}% Success ({signal.confidence}% Conf.)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-white/10 rounded-xl p-2.5 sm:p-3 text-left sm:text-right w-full sm:max-w-xs">
          <div className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase">AI Strategy Analysis</div>
          <div className="text-xs text-slate-200 mt-0.5 font-medium leading-tight">{signal.reason}</div>
        </div>
      </div>

      {/* Render Technical Indicators if available */}
      {signal.indicators && signal.indicators.length > 0 && (
        <IndicatorBadges indicators={signal.indicators} />
      )}

      {/* Trade execution control */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-950 border border-white/15 px-3 py-2 rounded-xl w-full sm:w-auto min-h-[44px]">
          <div className="flex items-center gap-1.5">
            <DollarSign size={16} className="text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-400">Trade Value:</span>
          </div>
          <input
            type="number"
            min="10"
            step="50"
            value={tradeAmount}
            onChange={(e) => setTradeAmount(Math.max(10, Number(e.target.value)))}
            className="w-20 sm:w-24 bg-transparent text-white font-mono font-bold text-sm text-right sm:text-left focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={onExecuteTrade}
          disabled={isExecuting || hasActiveTrade}
          className={`flex-1 w-full py-3 px-5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg min-h-[44px] active:scale-[0.98] ${
            hasActiveTrade
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
              : isCall
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
                : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/25'
          }`}
        >
          <Zap size={16} className="shrink-0" />
          <span>{hasActiveTrade ? 'Trade Running...' : `Execute ${signal.type} ($${tradeAmount})`}</span>
        </button>
      </div>
    </div>
  );
};

