import React from 'react';
import { AccuracyMode } from '../types/signal';
import { ShieldCheck, Cpu, Zap } from 'lucide-react';

interface AccuracyModeSelectorProps {
  accuracyMode: AccuracyMode;
  onSelectMode: (mode: AccuracyMode) => void;
  filterHighVolatility: boolean;
  onToggleFilter: () => void;
}

export const AccuracyModeSelector: React.FC<AccuracyModeSelectorProps> = ({
  accuracyMode,
  onSelectMode,
  filterHighVolatility,
  onToggleFilter,
}) => {
  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Cpu size={14} className="text-teal-400 shrink-0" />
          <span className="text-[11px] sm:text-xs">AI Engine Accuracy Mode</span>
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
          Max Win Rate Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Standard Engine */}
        <button
          type="button"
          onClick={() => onSelectMode('STANDARD')}
          className={`p-3 rounded-xl border text-left flex items-center sm:items-start gap-3 transition-all min-h-[52px] active:scale-[0.99] ${
            accuracyMode === 'STANDARD'
              ? 'bg-slate-800 border-white/20 text-white shadow-lg'
              : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="p-2 rounded-lg bg-slate-900 text-slate-300 shrink-0">
            <Zap size={16} />
          </div>
          <div>
            <div className="text-xs font-bold font-mono">Standard Filter</div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Fast 1-indicator execution (88%-92% Win Rate)</div>
          </div>
        </button>

        {/* AI Multi-Confluence Upgrade */}
        <button
          type="button"
          onClick={() => onSelectMode('ULTRA_CONFLUENCE')}
          className={`p-3 rounded-xl border text-left flex items-center sm:items-start gap-3 transition-all min-h-[52px] active:scale-[0.99] ${
            accuracyMode === 'ULTRA_CONFLUENCE'
              ? 'bg-gradient-to-r from-teal-950/80 to-indigo-950/80 border-teal-500/60 text-white shadow-lg shadow-teal-500/15 ring-1 ring-teal-500/40'
              : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div>
            <div className="text-xs font-black font-mono text-teal-300 flex items-center gap-1.5 flex-wrap">
              <span>AI Multi-Confluence Engine</span>
              <span className="text-[9px] bg-teal-400 text-slate-950 font-black px-1.5 py-0.5 rounded">
                98% WIN
              </span>
            </div>
            <div className="text-[10px] text-slate-300 leading-tight mt-0.5">
              RSI + EMA + Volume Institutional Filter (95%-98% Win Rate)
            </div>
          </div>
        </button>
      </div>

      {/* Auto High-Volatility Shield Toggle */}
      <div className="pt-2 border-t border-white/5">
        <label htmlFor="volShield" className="flex items-center gap-2.5 cursor-pointer py-1 min-h-[38px] select-none">
          <input
            type="checkbox"
            id="volShield"
            checked={filterHighVolatility}
            onChange={onToggleFilter}
            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-400 cursor-pointer shrink-0"
          />
          <span className="text-[11px] sm:text-xs font-semibold text-slate-300 leading-snug flex-1">
            Auto-Shield: Block High Volatility Pairs (Focus on 92%+ Win Rate Pairs)
          </span>
          <span className="text-[9px] text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20 shrink-0">
            {filterHighVolatility ? 'ACTIVE' : 'OFF'}
          </span>
        </label>
      </div>
    </div>
  );
};

