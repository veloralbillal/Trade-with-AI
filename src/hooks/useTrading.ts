import { useState, useCallback } from 'react';

export interface Position {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  amount: number;
  entryPrice: number;
  timestamp: number;
}

export interface TradeHistory {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  timestamp: number;
  profit?: number;
}

export function useTrading() {
  const [balance, setBalance] = useState(100000); // $100,000 demo balance
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<TradeHistory[]>([]);

  const placeOrder = useCallback((symbol: string, type: 'BUY' | 'SELL', amount: number, currentPrice: number) => {
    const cost = amount * currentPrice;
    
    if (type === 'BUY') {
      if (cost > balance) {
        return { success: false, message: 'Insufficient balance' };
      }
      
      const newPosition: Position = {
        id: Math.random().toString(36).substr(2, 9),
        symbol,
        type,
        amount,
        entryPrice: currentPrice,
        timestamp: Date.now(),
      };
      
      setBalance(prev => prev - cost);
      setPositions(prev => [...prev, newPosition]);
      setHistory(prev => [...prev, { ...newPosition, price: currentPrice }]);
      
      return { success: true, message: `Successfully bought ${amount} ${symbol}` };
    } else {
      // Selling
      const existingPositionIndex = positions.findIndex(p => p.symbol === symbol && p.type === 'BUY');
      
      if (existingPositionIndex === -1) {
        return { success: false, message: `No open position for ${symbol} to sell` };
      }
      
      const position = positions[existingPositionIndex];
      const sellAmount = Math.min(amount, position.amount);
      const proceeds = sellAmount * currentPrice;
      const profit = (currentPrice - position.entryPrice) * sellAmount;
      
      setBalance(prev => prev + proceeds);
      
      if (sellAmount === position.amount) {
        setPositions(prev => prev.filter((_, i) => i !== existingPositionIndex));
      } else {
        setPositions(prev => prev.map((p, i) => 
          i === existingPositionIndex ? { ...p, amount: p.amount - sellAmount } : p
        ));
      }
      
      setHistory(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        symbol,
        type: 'SELL',
        amount: sellAmount,
        price: currentPrice,
        timestamp: Date.now(),
        profit
      }]);
      
      return { success: true, message: `Successfully sold ${sellAmount} ${symbol}` };
    }
  }, [balance, positions]);

  return {
    balance,
    positions,
    history,
    placeOrder
  };
}
