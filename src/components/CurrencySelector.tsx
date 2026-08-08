import React from 'react';
import { CurrencyPair } from '../types/signal';
import { Coins, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CurrencySelectorProps {
  currencies: CurrencyPair[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  filterHighVolatility?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currencies,
  selectedSymbol,
  onSelect,
  filterHighVolatility = false,
}) => {
  const displayCurrencies = filterHighVolatility
    ? currencies.filter((c) => c.volatility !== 'High')
    : currencies;

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3">
      {/* Top Volatility Recommendation Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div className="text-[11px] sm:text-xs leading-snug">
            <span className="font-extrabold text-emerald-400 uppercase tracking-wide">
              Strategy Tip:
            </span>{' '}
            <span className="text-slate-200">
              Low/Moderate volatility pairs yield <strong>93%-98% accuracy</strong>.
            </span>
          </div>
        </div>

        {filterHighVolatility && (
          <div className="text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
            High Vol. Shielded
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Coins size={14} className="text-teal-400 shrink-0" />
          <span className="text-[11px] sm:text-xs">Currency Pair ({displayCurrencies.length})</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">Live Rates</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {displayCurrencies.map((c) => {
          const isSelected = c.symbol === selectedSymbol;
          const isLowMod = c.volatility === 'Low' || c.volatility === 'Moderate';

          return (
            <button
              key={c.symbol}
              type="button"
              onClick={() => onSelect(c.symbol)}
              className={`flex flex-col p-2.5 sm:p-3 rounded-xl border transition-all text-left relative overflow-hidden min-h-[72px] active:scale-[0.98] ${
                isSelected
                  ? 'bg-teal-500/15 border-teal-500/60 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/40'
                  : 'bg-slate-950/60 border-white/5 hover:border-white/20 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between w-full gap-1">
                <span className={`text-xs font-black font-mono truncate ${isSelected ? 'text-teal-300' : 'text-slate-100'}`}>
                  {c.symbol}
                </span>
                <span
                  className={`text-[9px] font-bold px-1 py-0.2 rounded shrink-0 ${
                    c.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {c.change >= 0 ? '+' : ''}
                  {c.change}%
                </span>
              </div>

              <div className="text-xs font-mono text-slate-300 my-1 font-bold">
                ${c.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </div>

              <div className="flex items-center justify-between w-full mt-auto pt-1 border-t border-white/5 text-[9px] font-semibold gap-1">
                <div className="flex items-center gap-0.5 truncate">
                  {isLowMod ? (
                    <span className="text-emerald-400 flex items-center gap-0.5 truncate">
                      <CheckCircle size={10} className="shrink-0" /> {c.volatility}
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-0.5 truncate">
                      <AlertTriangle size={10} className="shrink-0" /> High
                    </span>
                  )}
                </div>

                <div className={`font-mono font-bold shrink-0 ${isLowMod ? 'text-teal-400' : 'text-slate-400'}`}>
                  {c.winRate}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

