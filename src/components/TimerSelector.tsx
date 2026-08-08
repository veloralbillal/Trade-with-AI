import React from 'react';
import { Clock } from 'lucide-react';
import { TIMER_OPTIONS } from '../data/currencies';

interface TimerSelectorProps {
  selectedSeconds: number;
  onSelectTimer: (seconds: number) => void;
}

export const TimerSelector: React.FC<TimerSelectorProps> = ({
  selectedSeconds,
  onSelectTimer,
}) => {
  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Clock size={14} className="text-indigo-400 shrink-0" />
          <span className="text-[11px] sm:text-xs">Signal Timer Duration</span>
        </div>
        <span className="text-[10px] text-indigo-400 font-mono font-bold px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">
          {selectedSeconds} Seconds
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {TIMER_OPTIONS.map((timer) => {
          const isSelected = timer.seconds === selectedSeconds;
          return (
            <button
              key={timer.seconds}
              type="button"
              onClick={() => onSelectTimer(timer.seconds)}
              className={`min-h-[44px] py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all font-mono flex items-center justify-center active:scale-[0.98] ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                  : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {timer.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

