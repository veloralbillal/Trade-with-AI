import React from 'react';
import { Wallet, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  balance: number;
  onResetBalance: () => void;
}

export const Header: React.FC<HeaderProps> = ({ balance, onResetBalance }) => {
  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between bg-slate-950/90 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
          <Sparkles size={18} />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-wider bg-gradient-to-r from-teal-400 via-sky-400 to-purple-400 bg-clip-text text-transparent">
            AI SIGNAL PRO
          </h1>
          <p className="text-[10px] text-slate-400 leading-none">Instant Binary Signal Generator</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl font-mono">
          <Wallet size={14} className="text-teal-400" />
          <span className="text-xs text-slate-400">Balance:</span>
          <span className="text-sm font-bold text-emerald-400">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <button
          onClick={onResetBalance}
          title="Reset Balance"
          className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </header>
  );
};
