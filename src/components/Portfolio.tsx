import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, History, ArrowUpRight, ArrowDownRight, Clock, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { Position, Trade, BinaryTrade } from '@/hooks/useDemoAccount';

interface PortfolioProps {
  balance: number;
  positions: Position[];
  trades: Trade[];
  binaryTrades?: BinaryTrade[];
  prices?: Record<string, any>;
  onClosePosition?: (index: number, currentPrice: number) => any;
}

const BinaryContractCountdown: React.FC<{ contract: BinaryTrade }> = ({ contract }) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.round((contract.expiry - Date.now()) / 1000)));

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((contract.expiry - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [contract.expiry, timeLeft]);

  if (timeLeft <= 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-slate-950/40 border border-white/5">
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${contract.side === 'CALL' ? 'bg-sleek-teal animate-pulse' : 'bg-red-400 animate-pulse'}`} />
          <span className="font-bold text-slate-200">{contract.symbol}</span>
          <Badge className={contract.side === 'CALL' ? 'bg-sleek-teal/10 text-sleek-teal border-sleek-teal/20 text-[8px]' : 'bg-red-500/10 text-red-400 border-red-500/20 text-[8px]'} variant="outline">
            {contract.side}
          </Badge>
        </div>
        <span className="font-mono text-slate-400 font-bold text-[9px] flex items-center gap-1">
          <Clock size={10} className="text-sleek-purple animate-pulse" />
          {timeLeft}s
        </span>
      </div>

      <div className="flex items-center justify-between text-[8px] text-white/40 leading-none">
        <span>Contract: ${contract.amount} @ ${contract.entryPrice.toLocaleString()}</span>
        {contract.winChance && (
          <span className="text-[7.5px] font-bold text-sleek-teal bg-sleek-teal/10 px-1 py-0.5 rounded border border-sleek-teal/10">
            🎯 {contract.winChance}% Win Chance
          </span>
        )}
        <span className="text-sleek-purple font-medium">85% Reward</span>
      </div>
    </div>
  );
}

export function Portfolio({ balance, positions, trades, binaryTrades = [], prices = {}, onClosePosition }: PortfolioProps) {
  const activeBinaryContracts = binaryTrades.filter(t => t.status === 'PENDING' && t.expiry > Date.now());

  const handleExportCSV = () => {
    if (trades.length === 0) return;
    
    // CSV file header
    const headers = ["Time", "Asset/Symbol", "Type", "Action/Side", "Amount", "Entry Price ($)", "PnL ($)", "Status"];
    
    // Log rows details cleanly
    const rows = trades.map(t => {
      const formattedTime = new Date(t.timestamp).toLocaleString();
      const pnlAmt = t.pnl !== undefined ? t.pnl.toFixed(2) : '0.00';
      return [
        `"${formattedTime}"`,
        `"${t.symbol}"`,
        `"${t.type}"`,
        `"${t.side}"`,
        t.amount,
        t.price,
        pnlAmt,
        `"${t.pnlStatus || 'N/A'}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `trade_history_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      {/* Account Summary */}
      <Card className="bg-sleek-card border-white/5 rounded-[24px] overflow-hidden backdrop-blur-md flex flex-col h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-sleek-text-secondary flex items-center gap-2">
            <Wallet size={14} className="text-sleek-blue" />
            Demo Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between overflow-hidden gap-3 pb-4">
          <div>
            <div className="text-2xl font-bold tracking-tight mb-0.5">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-sleek-up flex items-center gap-1">
              <TrendingUp size={11} />
              Live Demo P&L Checking Active
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1 scrollbar-hide">
            <div>
              <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">Open Positions</h4>
              {positions.length === 0 ? (
                <div className="text-[10px] text-white/20 italic pb-2">No open positions</div>
              ) : (
                <div className="space-y-2">
                  {positions.map((pos, i) => {
                    const livePrice = prices[pos.symbol]?.price || pos.entryPrice;
                    const isBuy = pos.side === 'BUY';
                    const originalCost = pos.amount * pos.entryPrice;
                    const liveValue = pos.amount * livePrice;
                    const posPnl = isBuy ? (liveValue - originalCost) : (originalCost - liveValue);
                    const pnlPercent = (posPnl / originalCost) * 100;
                    
                    return (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${
                            isBuy ? 'bg-sleek-teal/10 text-sleek-teal' : 'bg-orange-500/10 text-orange-400'
                          }`}>
                            {isBuy ? 'L' : 'S'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold flex items-center gap-1">
                              <span className="truncate">{pos.symbol}</span>
                              <Badge className={`text-[7px] leading-none h-3.5 px-1 font-bold ${
                                isBuy 
                                  ? 'bg-sleek-teal/10 text-sleek-teal border-sleek-teal/20' 
                                  : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              }`} variant="outline">
                                {pos.side}
                              </Badge>
                            </div>
                            <div className="text-[8px] text-sleek-text-secondary font-mono truncate">{pos.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} Units</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-right">
                          <div className="flex flex-col">
                            <div className={`text-[10px] font-bold font-mono ${posPnl >= 0 ? 'text-sleek-teal' : 'text-red-400'}`}>
                              {posPnl >= 0 ? '+' : ''}${posPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              <span className="text-[8px] ml-0.5">({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)</span>
                            </div>
                            <div className="text-[7.5px] text-sleek-text-secondary leading-normal">
                              <span>Entry: ${pos.entryPrice.toLocaleString()}</span>
                              {pos.tp && <span className="text-sleek-teal block">TP: ${pos.tp.toLocaleString()}</span>}
                              {pos.sl && <span className="text-red-400 block">SL: ${pos.sl.toLocaleString()}</span>}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => onClosePosition?.(i, livePrice)}
                            className="px-1.5 py-1 text-[8.5px] font-black tracking-wider text-red-400 bg-red-400/10 border border-red-500/20 rounded hover:bg-red-400/20 active:scale-95 transition-all uppercase leading-none shrink-0"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Render Active Binary Options Contracts */}
            {activeBinaryContracts.length > 0 && (
              <div>
                <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-sleek-purple mb-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sleek-purple animate-pulse" />
                  Binary Contracts ({activeBinaryContracts.length})
                </h4>
                <div className="space-y-2">
                  {activeBinaryContracts.map((contract, i) => (
                    <BinaryContractCountdown key={i} contract={contract} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Trades */}
      <Card className="bg-sleek-card border-white/5 rounded-[24px] overflow-hidden backdrop-blur-md flex flex-col h-full">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-sleek-text-secondary flex items-center gap-2">
            <History size={14} className="text-sleek-purple" />
            Trade History
          </CardTitle>
          {trades.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-slate-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 active:scale-95 transition-all uppercase tracking-wider leading-none"
              title="Download Trade History as CSV"
            >
              <Download size={10} className="text-sleek-purple" />
              Export CSV
            </button>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden pb-4">
          <div className="space-y-2 h-full max-h-[220px] md:max-h-none overflow-y-auto pr-2 scrollbar-hide">
            {trades.length === 0 ? (
              <div className="text-[10px] text-white/20 italic text-center py-8">No recent trades</div>
            ) : (
              trades.map((trade, i) => {
                const isTradeWin = trade.pnlStatus === 'WIN';
                const isTradeLoss = trade.pnlStatus === 'LOSS';
                const isDirectionUp = trade.side === 'BUY' || trade.side === 'CALL';
                
                const iconColorClass = isTradeWin 
                  ? 'bg-sleek-up/10 text-sleek-up' 
                  : isTradeLoss 
                    ? 'bg-sleek-down/10 text-sleek-down' 
                    : isDirectionUp 
                      ? 'bg-sleek-up/10 text-sleek-up' 
                      : 'bg-sleek-down/10 text-sleek-down';

                const textPnlClass = isTradeWin
                  ? 'text-sleek-up'
                  : isTradeLoss
                    ? 'text-sleek-down'
                    : isDirectionUp
                      ? 'text-sleek-up'
                      : 'text-sleek-down';

                return (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColorClass}`}>
                        {(isTradeWin || (!isTradeLoss && isDirectionUp)) ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold flex items-center gap-1">
                          {trade.symbol}
                          <Badge variant="outline" className="text-[8px] h-3 px-1 border-white/10 text-white/40">
                            {trade.type}
                          </Badge>
                        </div>
                        <div className="text-[8px] text-sleek-text-secondary">
                          {new Date(trade.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-0.5">
                      <div className={`text-[10px] font-bold font-mono ${textPnlClass}`}>
                        {trade.side} {trade.amount.toLocaleString(undefined, { maximumFractionDigits: 5 })}
                      </div>
                      <div className="text-[8px] text-slate-400 font-mono">@ ${trade.price.toLocaleString()}</div>
                      {trade.pnlStatus && (
                        <span className={`text-[9px] font-black mt-1 font-mono px-1.5 py-0.5 rounded leading-none ${
                          trade.pnlStatus === 'WIN' 
                            ? 'text-sleek-teal bg-sleek-teal/10 border border-sleek-teal/20' 
                            : trade.pnlStatus === 'LOSS'
                              ? 'text-red-400 bg-red-400/10 border border-red-500/10'
                              : 'text-amber-400 bg-amber-400/10 border border-amber-500/10'
                          }`}
                        >
                          {trade.pnlStatus === 'WIN' 
                            ? `PROFIT: +$${trade.pnl?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                            : trade.pnlStatus === 'LOSS'
                              ? `LOSS: -$${Math.abs(trade.pnl || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : 'PENDING'
                          }
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
