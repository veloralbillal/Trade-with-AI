import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface SignalActionProps {
  onGenerateSignal: () => void;
  isGenerating: boolean;
  selectedSymbol: string;
  selectedTimerSeconds: number;
}

export const SignalAction: React.FC<SignalActionProps> = ({
  onGenerateSignal,
  isGenerating,
  selectedSymbol,
  selectedTimerSeconds,
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onGenerateSignal}
        disabled={isGenerating}
        className="w-full py-4 sm:py-5 px-4 sm:px-8 rounded-2xl bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-600 hover:from-teal-400 hover:via-sky-400 hover:to-indigo-500 text-slate-950 font-black text-sm sm:text-lg md:text-xl uppercase tracking-wider shadow-2xl shadow-sky-500/30 hover:shadow-sky-500/50 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3 border border-white/20 relative overflow-hidden min-h-[56px]"
      >
        {isGenerating ? (
          <>
            <RefreshCw size={20} className="animate-spin text-slate-950 shrink-0" />
            <span className="truncate">Analyzing Market Feed...</span>
          </>
        ) : (
          <>
            <Sparkles size={20} className="transition-transform shrink-0" />
            <span className="truncate">
              GENERATE {selectedSymbol} SIGNAL ({selectedTimerSeconds}S)
            </span>
          </>
        )}
      </button>

      <p className="text-[10px] sm:text-[11px] text-slate-400 text-center font-medium leading-tight px-2">
        AI algorithm scans real-time price action & momentum indicators to predict highest probability signal.
      </p>
    </div>
  );
};

