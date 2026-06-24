import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CryptoPrice } from '@/hooks/useCryptoData';

interface MarketOverviewProps {
  prices: Record<string, CryptoPrice>;
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

export function MarketOverview({ prices, selectedSymbol, onSelect }: MarketOverviewProps) {
  const sortedSymbols = Object.values(prices).sort((a, b) => b.volume - a.volume);

  return (
    <Card className="bg-sleek-card border-white/5 h-full rounded-[24px] overflow-hidden backdrop-blur-md">
      <CardHeader className="py-4 px-6 border-b border-white/5">
        <CardTitle className="text-sm font-bold text-sleek-text-secondary uppercase tracking-widest">Market Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-4">
            {sortedSymbols.map((crypto) => (
              <div
                key={crypto.symbol}
                onClick={() => onSelect(crypto.symbol)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedSymbol === crypto.symbol 
                    ? 'bg-sleek-blue/10 border border-sleek-blue/20' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sleek-text-primary">{crypto.symbol.replace('USDT', '')}</span>
                  <span className="text-[10px] text-sleek-text-secondary font-medium">USDT</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-sm font-bold text-sleek-text-primary">
                    ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </span>
                  <div className={`flex items-center text-[10px] font-bold ${crypto.change >= 0 ? 'text-sleek-up' : 'text-sleek-down'}`}>
                    {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
