import React from 'react';
import { TradeHistoryItem } from '../types/signal';
import { History, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle } from 'lucide-react';

interface SignalHistoryProps {
  history: TradeHistoryItem[];
}

export const SignalHistory: React.FC<SignalHistoryProps> = ({ history }) => {
  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <History size={14} className="text-teal-400 shrink-0" />
          <span className="text-[11px] sm:text-xs">Trade Signal History</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{history.length} Trades</span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 italic">No trades executed yet.</div>
      ) : (
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-hide">
          {history.map((item) => {
            const isCall = item.type === 'CALL';
            const isWin = item.status === 'WIN';

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-white/5 text-xs font-mono gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${isCall ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {isCall ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate text-[11px] sm:text-xs">
                      {item.symbol} • {item.type} ({item.timerSeconds}s)
                    </div>
                    <div className="text-[9px] text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-slate-300 text-[11px] sm:text-xs">
                    ${item.amount} @ ${item.entryPrice}
                  </div>
                  {item.status === 'PENDING' ? (
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded inline-block">
                      RUNNING...
                    </span>
                  ) : isWin ? (
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded flex items-center gap-1 justify-end">
                      <CheckCircle2 size={10} /> WIN (+${item.profit.toFixed(2)})
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded flex items-center gap-1 justify-end">
                      <XCircle size={10} /> LOSS (-${item.amount.toFixed(2)})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

