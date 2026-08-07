import React from 'react';
import { TechnicalIndicator } from '../types/signal';
import { Check, Sparkles } from 'lucide-react';

interface IndicatorBadgesProps {
  indicators: TechnicalIndicator[];
}

export const IndicatorBadges: React.FC<IndicatorBadgesProps> = ({ indicators }) => {
  if (!indicators || indicators.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 bg-slate-950/70 border border-white/5 rounded-xl p-2.5">
      <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
        <Sparkles size={11} />
        <span>Confluence Indicators Confirmed:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {indicators.map((ind, i) => (
          <span
            key={i}
            className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center gap-1"
          >
            <Check size={10} className="text-emerald-400" />
            <span>{ind.name}: <strong>{ind.value}</strong></span>
          </span>
        ))}
      </div>
    </div>
  );
};
