import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries, LineStyle } from 'lightweight-charts';
import { Card, CardContent } from '@/components/ui/card';
import { CandleData } from '@/hooks/useCryptoData';
import { Position, BinaryTrade, Trade } from '@/hooks/useDemoAccount';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft } from 'lucide-react';

interface ChartProps {
  data: CandleData[];
  symbol: string;
  color?: string;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  positions?: Position[];
  binaryTrades?: BinaryTrade[];
  trades?: Trade[];
}

export function CryptoChart({ 
  data, 
  symbol, 
  color = "#38bdf8", 
  onLoadMore, 
  isLoadingMore, 
  positions = [],
  binaryTrades = [],
  trades = []
}: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<any[]>([]);
  const [lastFitKey, setLastFitKey] = useState<string>('');
  const [secondsTick, setSecondsTick] = useState<number>(0);

  // Simple local ticker that re-evaluates active timings for HUD rendering
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Track state of the data series to prevent unnecessary full chart refreshes (which resets visible ranges)
  const prevDataLengthRef = useRef<number>(0);
  const prevFirstTimeRef = useRef<number>(0);
  const prevSymbolRef = useRef<string>('');

  const drawPriceLines = (
    series: ISeriesApi<"Candlestick">, 
    currentPositions: Position[], 
    currentBinaryTrades: BinaryTrade[]
  ) => {
    // Clear old lines
    priceLinesRef.current.forEach(line => {
      try {
        series.removePriceLine(line);
      } catch (err) {
        console.warn('Error removing price line:', err);
      }
    });
    priceLinesRef.current = [];

    // 1. Draw Forex/Crypto Positions
    const symbolPositions = currentPositions.filter(p => p.symbol === symbol);
    
    symbolPositions.forEach(pos => {
      // Entry Price Line (Solid cyan/orange)
      try {
        const sideColor = pos.side === 'BUY' ? '#22d3ee' : '#fb923c';
        const entryLine = series.createPriceLine({
          price: pos.entryPrice,
          color: sideColor,
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: `ENTRY (${pos.side}): $${pos.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        });
        if (entryLine) priceLinesRef.current.push(entryLine);
      } catch (e) {
        console.error(e);
      }

      // Take Profit
      if (pos.tp) {
        try {
          const tpLine = series.createPriceLine({
            price: pos.tp,
            color: '#2dd4bf',
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: `TP: $${pos.tp.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
          });
          if (tpLine) priceLinesRef.current.push(tpLine);
        } catch (e) {
          console.error(e);
        }
      }

      // Stop Loss
      if (pos.sl) {
        try {
          const slLine = series.createPriceLine({
            price: pos.sl,
            color: '#f87171',
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: `SL: $${pos.sl.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
          });
          if (slLine) priceLinesRef.current.push(slLine);
        } catch (e) {
          console.error(e);
        }
      }
    });

    // 2. Draw Active Binary Option Entries (Dotted teal/red indicator)
    const symbolBinaryTrades = currentBinaryTrades.filter(
      t => t.symbol === symbol && t.status === 'PENDING'
    );
    
    symbolBinaryTrades.forEach(bt => {
      try {
        const sideColor = bt.side === 'CALL' ? '#0d9488' : '#e11d48';
        const binaryLine = series.createPriceLine({
          price: bt.entryPrice,
          color: sideColor,
          lineWidth: 2,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: `BINARY ${bt.side}: $${bt.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        });
        if (binaryLine) priceLinesRef.current.push(binaryLine);
      } catch (e) {
        console.error(e);
      }
    });
  };

  const findCandleTimeForTimestamp = (timestampMs: number, candleData: CandleData[]): number | null => {
    if (candleData.length === 0) return null;
    const tradeSecs = Math.floor(timestampMs / 1000);
    
    let bestCandleTime: number | null = null;
    let minDiff = Infinity;
    
    for (let i = candleData.length - 1; i >= 0; i--) {
      const candle = candleData[i];
      const diff = Math.abs(candle.time - tradeSecs);
      if (diff < minDiff && diff < 120) { // must be within 2 minutes of a candle 
        minDiff = diff;
        bestCandleTime = candle.time;
      }
    }
    
    if (bestCandleTime === null) {
      bestCandleTime = Math.floor(tradeSecs / 60) * 60;
    }
    
    return bestCandleTime;
  };

  const drawMarkers = (
    series: ISeriesApi<"Candlestick">,
    currentTrades: Trade[],
    candleData: CandleData[]
  ) => {
    if (candleData.length === 0) return;

    const symbolTrades = currentTrades.filter(t => t.symbol === symbol);
    const markers: any[] = [];

    symbolTrades.forEach((trade, idx) => {
      const candleTime = findCandleTimeForTimestamp(trade.timestamp, candleData);
      if (!candleTime) return;

      const isBuy = trade.side === 'BUY' || trade.side === 'CALL';
      const isPending = trade.pnlStatus === 'PENDING';
      const isWin = trade.pnlStatus === 'WIN';
      const isLoss = trade.pnlStatus === 'LOSS';

      let label = '';
      if (isPending) {
        if (trade.side === 'CALL') label = 'CALL 🗲';
        else if (trade.side === 'PUT') label = 'PUT 🗲';
        else if (trade.side === 'BUY') label = 'BUY 📈';
        else if (trade.side === 'SELL') label = 'SELL 📉';
        else label = trade.side;
      } else if (isWin) {
        if (trade.side === 'CALL' || trade.side === 'PUT') {
          label = `${trade.side} WIN 🏆`;
        } else {
          label = `${trade.side} TP 🎯`;
        }
      } else if (isLoss) {
        if (trade.side === 'CALL' || trade.side === 'PUT') {
          label = `${trade.side} LOSS 💀`;
        } else {
          label = `${trade.side} SL 🛑`;
        }
      } else {
        label = trade.side;
      }

      let color = '';
      if (isBuy) {
        color = isPending ? '#2dd4bf' : (isWin ? '#22c55e' : '#ef4444');
      } else {
        color = isPending ? '#fb923c' : (isWin ? '#22c55e' : '#ef4444');
      }

      markers.push({
        time: candleTime,
        position: isBuy ? 'belowBar' : 'aboveBar',
        color: color,
        shape: isBuy ? 'arrowUp' : 'arrowDown',
        text: label,
        size: 1.5,
        id: `trade_${trade.timestamp}_${idx}`
      });
    });

    markers.sort((a, b) => a.time - b.time);

    const uniqueMarkers: any[] = [];
    const seenTimes = new Set<number>();
    
    markers.forEach(m => {
      if (!seenTimes.has(m.time)) {
        seenTimes.add(m.time);
        uniqueMarkers.push(m);
      } else {
        const existing = uniqueMarkers.find(em => em.time === m.time);
        if (existing) {
          existing.text = `${existing.text} | ${m.text}`;
          if (m.text.includes('WIN') || existing.text.includes('WIN') || m.text.includes('TP') || existing.text.includes('TP')) {
            existing.color = '#22c55e';
          }
        }
      }
    });

    try {
      (series as any).setMarkers(uniqueMarkers);
    } catch (err) {
      console.warn("Could not draw markers to lightweight-charts:", err);
    }
  };

  // Re-create chart when asset symbol changes
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: color,
          labelBackgroundColor: '#0f172a',
        },
        horzLine: {
          color: color,
          labelBackgroundColor: '#0f172a',
        },
      },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#2dd4bf',
      downColor: '#f87171',
      borderVisible: false,
      wickUpColor: '#2dd4bf',
      wickDownColor: '#f87171',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Detect scrolling to the left
    chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
      if (!range || !onLoadMore || isLoadingMore) return;
      
      const logicalRange = chart.timeScale().getVisibleLogicalRange();
      if (logicalRange && logicalRange.from < 10) {
        onLoadMore();
      }
    });

    // ResizeObserver configuration for perfect responsive container tracking
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0].contentRect) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width: Math.max(100, width), height: Math.max(100, height) });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [symbol]);

  // Sync data, fit content, and update price lines
  useEffect(() => {
    if (seriesRef.current && chartRef.current && data.length > 0) {
      const lastCandle = data[data.length - 1];
      const isSameSymbol = prevSymbolRef.current === symbol;
      const isHistoricalLoad = data.length > prevDataLengthRef.current && data[0]?.time !== prevFirstTimeRef.current;
      
      if (!isSameSymbol || prevDataLengthRef.current === 0 || isHistoricalLoad || Math.abs(data.length - prevDataLengthRef.current) > 2) {
        // Full chart initialization / reload
        seriesRef.current.setData(data as any);
        
        const firstTime = data[0]?.time;
        const currentKey = `${symbol}_${firstTime}`;
        if (lastFitKey !== currentKey) {
          // Debounce fitting content to avoid layout flickering
          const timer = setTimeout(() => {
            chartRef.current?.timeScale().fitContent();
          }, 100);
          setLastFitKey(currentKey);
          return () => clearTimeout(timer);
        }
      } else {
        // Continuous live real-time tick update (prevents annoying flashes/resets)
        seriesRef.current.update(lastCandle as any);
      }
      
      // Draw EN, TP, and SL levels on the candlestick series
      drawPriceLines(seriesRef.current, positions, binaryTrades);

      // Draw trade markers right above or below corresponding candles
      drawMarkers(seriesRef.current, trades, data);
 
      // Save refs for next update calculation
      prevDataLengthRef.current = data.length;
      prevFirstTimeRef.current = data[0]?.time || 0;
      prevSymbolRef.current = symbol;
    }
  }, [data, symbol, lastFitKey, positions, binaryTrades, trades]);

  const activePositions = positions.filter(p => p.symbol === symbol);
  const activeBinaries = binaryTrades.filter(t => t.symbol === symbol && t.status === 'PENDING' && t.expiry > Date.now());

  return (
    <Card className="w-full h-full bg-sleek-card border-white/5 rounded-[24px] overflow-hidden backdrop-blur-md relative flex flex-col">
      <CardContent className="flex-1 p-4 relative min-h-0">
        {/* Load More Button Overlay */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="bg-slate-950/70 border-white/10 hover:bg-slate-900/80 text-[10px] font-bold uppercase tracking-wider h-8 backdrop-blur-sm"
          >
            {isLoadingMore ? (
              <Loader2 className="w-3 h-3 animate-spin mr-2" />
            ) : (
              <ChevronLeft className="w-3 h-3 mr-2" />
            )}
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>

        {/* Active Trade / Positions HUD overlay */}
        {(activePositions.length > 0 || activeBinaries.length > 0) && (
          <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 max-w-[280px]">
            {activePositions.map((pos, idx) => (
              <div 
                key={`hud_pos_${idx}`} 
                className="bg-slate-950/90 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md flex flex-col gap-1.5"
                id={`hud-active-pos-${idx}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Active Forex Trade</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    pos.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {pos.side}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs font-mono">
                  <span className="text-slate-400 text-[10px]">Entry:</span>
                  <span className="text-slate-200 text-right font-semibold">${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  
                  {pos.tp && (
                    <>
                      <span className="text-emerald-400 text-[10px]">Take Profit (TP):</span>
                      <span className="text-emerald-400 text-right font-medium">${pos.tp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </>
                  )}
                  
                  {pos.sl && (
                    <>
                      <span className="text-rose-400 text-[10px]">Stop Loss (SL):</span>
                      <span className="text-rose-400 text-right font-medium">${pos.sl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </>
                  )}
                </div>
              </div>
            ))}

            {activeBinaries.map((bin, idx) => {
              const secondsLeft = Math.max(0, Math.ceil((bin.expiry - Date.now()) / 1000));
              return (
                <div 
                  key={`hud_bin_${idx}`} 
                  className="bg-slate-950/90 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md flex flex-col gap-1.5"
                  id={`hud-active-bin-${idx}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Active Binary Contract</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      bin.side === 'CALL' ? 'bg-teal-500/20 text-teal-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {bin.side}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs font-mono">
                    <span className="text-slate-400 text-[10px]">Entry Price:</span>
                    <span className="text-slate-200 text-right font-semibold">${bin.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    
                    <span className="text-slate-400 text-[10px]">Time Remaining:</span>
                    <span className="text-purple-400 text-right font-bold animate-pulse">{secondsLeft}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div ref={chartContainerRef} className="w-full h-full min-h-[300px] md:min-h-[350px]" />
      </CardContent>
    </Card>
  );
}

