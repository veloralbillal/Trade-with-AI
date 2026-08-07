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
    <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
      {/* Top Volatility Recommendation Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="text-xs">
            <span className="font-extrabold text-emerald-400 uppercase tracking-wide">
              Strategy Recommendation:
            </span>{' '}
            <span className="text-slate-200">
              <strong>Low to Moderate Volatility</strong> pairs are recommended for highest accuracy (<strong>93%-98% Success Rate</strong>).
            </span>
          </div>
        </div>

        {filterHighVolatility && (
          <div className="text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
            High Volatility Filtered
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Coins size={14} className="text-teal-400" />
          <span>Select Currency Pair ({displayCurrencies.length} Available)</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Live Prices & Success Rates</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {displayCurrencies.map((c) => {
          const isSelected = c.symbol === selectedSymbol;
          const isLowMod = c.volatility === 'Low' || c.volatility === 'Moderate';

          return (
            <button
              key={c.symbol}
              onClick={() => onSelect(c.symbol)}
              className={`flex flex-col p-3 rounded-xl border transition-all text-left relative overflow-hidden ${
                isSelected
                  ? 'bg-teal-500/15 border-teal-500/60 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/40'
                  : 'bg-slate-950/60 border-white/5 hover:border-white/20 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-black font-mono ${isSelected ? 'text-teal-300' : 'text-slate-100'}`}>
                  {c.symbol}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
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

              <div className="flex items-center justify-between w-full mt-1 pt-1.5 border-t border-white/5 text-[9px] font-semibold">
                <div className="flex items-center gap-1">
                  {isLowMod ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle size={10} /> {c.volatility} Vol.
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <AlertTriangle size={10} /> High Vol.
                    </span>
                  )}
                </div>

                <div className={`font-mono font-bold ${isLowMod ? 'text-teal-400' : 'text-slate-400'}`}>
                  {c.winRate}% Win Rate
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
