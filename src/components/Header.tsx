import React from 'react';
import { Wallet, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  balance: number;
  onResetBalance: () => void;
}

export const Header: React.FC<HeaderProps> = ({ balance, onResetBalance }) => {
  return (
    <header className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between bg-slate-950/95 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2 min-w-0 shrink">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 shrink-0">
          <Sparkles size={18} />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-extrabold tracking-wider bg-gradient-to-r from-teal-400 via-sky-400 to-purple-400 bg-clip-text text-transparent truncate">
            AI SIGNAL PRO
          </h1>
          <p className="text-[9px] sm:text-[10px] text-slate-400 leading-none truncate">
            Instant Binary Signal Generator
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 border border-white/10 px-2.5 sm:px-3 py-1.5 rounded-xl font-mono">
          <Wallet size={14} className="text-teal-400 shrink-0" />
          <span className="text-[10px] sm:text-xs text-slate-400 hidden xs:inline">Balance:</span>
          <span className="text-xs sm:text-sm font-bold text-emerald-400">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <button
          onClick={onResetBalance}
          title="Reset Balance"
          className="p-2 sm:p-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white rounded-xl transition-all min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </header>
  );
};

