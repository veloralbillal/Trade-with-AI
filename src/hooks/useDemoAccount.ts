import { useState, useCallback, useEffect } from 'react';

export interface Position {
  symbol: string;
  side: 'BUY' | 'SELL';
  amount: number;
  entryPrice: number;
  tp?: number;
  sl?: number;
  timestamp: number;
  type: 'FOREX' | 'CRYPTO';
}

export interface BinaryTrade {
  symbol: string;
  side: 'CALL' | 'PUT';
  amount: number;
  entryPrice: number;
  expiry: number;
  status: 'PENDING' | 'WIN' | 'LOSS';
  timestamp: number;
  winChance?: number;
}

export interface Trade {
  symbol: string;
  side: 'BUY' | 'SELL' | 'CALL' | 'PUT';
  amount: number;
  price: number;
  timestamp: number;
  type: 'FOREX' | 'CRYPTO' | 'BINARY';
  pnl?: number;
  pnlStatus?: 'WIN' | 'LOSS' | 'PENDING';
}

export function useDemoAccount() {
  const [balance, setBalance] = useState<number>(1000000); // $1M demo balance
  const [positions, setPositions] = useState<Position[]>([]);
  const [binaryTrades, setBinaryTrades] = useState<BinaryTrade[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isAutoTrading, setIsAutoTrading] = useState(false);
  const [autoTradingMode, setAutoTradingMode] = useState<'FOREX' | 'BINARY'>('FOREX');

  // Load from localStorage on init
  useEffect(() => {
    const saved = localStorage.getItem('demo_account');
    if (saved) {
      const data = JSON.parse(saved);
      setBalance(data.balance);
      setPositions(data.positions || []);
      setBinaryTrades(data.binaryTrades || []);
      setTrades(data.trades || []);
      setIsAutoTrading(data.isAutoTrading || false);
      setAutoTradingMode(data.autoTradingMode || 'FOREX');
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('demo_account', JSON.stringify({ 
      balance, 
      positions, 
      binaryTrades, 
      trades, 
      isAutoTrading,
      autoTradingMode 
    }));
  }, [balance, positions, binaryTrades, trades, isAutoTrading, autoTradingMode]);

  const executeTrade = useCallback((
    symbol: string, 
    side: 'BUY' | 'SELL', 
    amount: number, 
    currentPrice: number, 
    tp?: number, 
    sl?: number,
    type: 'FOREX' | 'CRYPTO' = 'CRYPTO'
  ) => {
    const isOpeningBuy = side === 'BUY';
    const oppositeSide = isOpeningBuy ? 'SELL' : 'BUY';
    
    // Check if we have an existing opposite position to close/reduce
    const existingPosIdx = positions.findIndex(p => p.symbol === symbol && p.side === oppositeSide);
    
    if (existingPosIdx !== -1) {
      // WE ARE CLOSING/REDUCING THE OPPOSITE POSITION
      const pos = positions[existingPosIdx];
      const closedAmount = Math.min(amount, pos.amount);
      const originalCost = closedAmount * pos.entryPrice;
      
      // Calculate PnL
      const isBuyClosed = pos.side === 'BUY';
      const pnl = isBuyClosed 
        ? closedAmount * (currentPrice - pos.entryPrice)
        : closedAmount * (pos.entryPrice - currentPrice);
      
      const balanceReturn = originalCost + pnl;
      setBalance(prev => prev + balanceReturn);
      
      // Manage position array
      if (pos.amount === closedAmount) {
        setPositions(prev => prev.filter((_, idx) => idx !== existingPosIdx));
      } else {
        setPositions(prev => prev.map((p, idx) => idx === existingPosIdx ? { ...p, amount: p.amount - closedAmount } : p));
      }
      
      // Log the closed trade
      const tradeTime = Date.now();
      const closedTrade: Trade = {
        symbol,
        side, // If opposite was BUY, we executed a SELL trade to close it
        amount: closedAmount,
        price: currentPrice,
        timestamp: tradeTime,
        type,
        pnl,
        pnlStatus: pnl >= 0 ? 'WIN' : 'LOSS'
      };
      setTrades(prev => [closedTrade, ...prev].slice(0, 50));
      
      return { 
        success: true, 
        message: `Closed ${closedAmount} units of ${symbol} position. P&L: $${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
      };
    } else {
      // WE ARE OPENING A NEW POSITION
      const totalCost = amount * currentPrice;
      if (balance < totalCost) {
        return { success: false, message: 'Insufficient balance' };
      }
      
      // Auto calculate TP and SL for Forex if they aren't provided
      // For BUY: TP goes UP, SL goes DOWN
      // For SELL: TP goes DOWN, SL goes UP
      const finalTp = tp || (type === 'FOREX' ? (side === 'BUY' ? currentPrice * 1.015 : currentPrice * 0.985) : undefined);
      const finalSl = sl || (type === 'FOREX' ? (side === 'BUY' ? currentPrice * 0.985 : currentPrice * 1.015) : undefined);

      setBalance(prev => prev - totalCost);
      const newPos: Position = { 
        symbol, 
        side, 
        amount, 
        entryPrice: currentPrice, 
        tp: finalTp, 
        sl: finalSl, 
        timestamp: Date.now(), 
        type 
      };
      setPositions(prev => [...prev, newPos]);
      
      // Log the open trade
      const tradeTime = Date.now();
      const openTrade: Trade = {
        symbol,
        side,
        amount,
        price: currentPrice,
        timestamp: tradeTime,
        type,
        pnlStatus: 'PENDING'
      };
      setTrades(prev => [openTrade, ...prev].slice(0, 50));
      
      return { 
        success: true, 
        message: `Successfully opened ${side} ${amount} units of ${symbol} at $${currentPrice.toLocaleString()}` 
      };
    }
  }, [balance, positions]);

  const closePosition = useCallback((
    index: number,
    currentPrice: number
  ) => {
    if (index < 0 || index >= positions.length) return { success: false, message: 'Position not found' };
    const pos = positions[index];
    const originalCost = pos.amount * pos.entryPrice;
    const currentVal = pos.amount * currentPrice;
    const isBuy = pos.side === 'BUY';
    const pnl = isBuy ? (currentVal - originalCost) : (originalCost - currentVal);
    
    // We refund original cost + P&L
    setBalance(prev => prev + (originalCost + pnl));
    setPositions(prev => prev.filter((_, idx) => idx !== index));
    
    // Log in trades history
    setTrades(prev => [
      {
        symbol: pos.symbol,
        side: pos.side === 'BUY' ? 'SELL' : 'BUY', // Offset action to close
        amount: pos.amount,
        price: currentPrice,
        timestamp: Date.now(),
        type: pos.type,
        pnl: pnl,
        pnlStatus: pnl >= 0 ? 'WIN' : 'LOSS'
      },
      ...prev
    ].slice(0, 50));

    return { success: true, message: `Successfully closed ${pos.symbol} position. PnL: $${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` };
  }, [positions]);

  // Check and process Forex positions for automated TP/SL triggers based on live prices
  const checkTP_SL = useCallback((currentPrices: Record<string, { price: number }>) => {
    let balanceAdjustment = 0;
    const closedPositionsList: Trade[] = [];
    const triggeredIndices: number[] = [];

    positions.forEach((pos, idx) => {
      const priceObj = currentPrices[pos.symbol];
      if (!priceObj) return;
      const livePrice = priceObj.price;

      const isBuy = pos.side === 'BUY';
      let hitTP = false;
      let hitSL = false;

      if (pos.tp) {
        if (isBuy && livePrice >= pos.tp) hitTP = true;
        if (!isBuy && livePrice <= pos.tp) hitTP = true;
      }
      if (pos.sl) {
        if (isBuy && livePrice <= pos.sl) hitSL = true;
        if (!isBuy && livePrice >= pos.sl) hitSL = true;
      }

      if (hitTP || hitSL) {
        triggeredIndices.push(idx);
        const originalCost = pos.amount * pos.entryPrice;
        const currentVal = pos.amount * livePrice;
        const pnl = isBuy ? (currentVal - originalCost) : (originalCost - currentVal);
        
        balanceAdjustment += (originalCost + pnl);

        closedPositionsList.push({
          symbol: pos.symbol,
          side: isBuy ? 'SELL' : 'BUY', // Offset action
          amount: pos.amount,
          price: livePrice,
          timestamp: Date.now(),
          type: pos.type,
          pnl: pnl,
          pnlStatus: pnl >= 0 ? 'WIN' : 'LOSS'
        });
      }
    });

    if (triggeredIndices.length > 0) {
      setPositions(prev => prev.filter((_, idx) => !triggeredIndices.includes(idx)));
      setBalance(prev => prev + balanceAdjustment);
      setTrades(prev => [...closedPositionsList, ...prev].slice(0, 50));
    }

    // Process expired pending contract binary options based on true live price comparisons
    const now = Date.now();
    let binaryUpdated = false;
    let binaryBalanceAdjustment = 0;
    const expiredTicks: { timestamp: number; isWin: boolean; pnl: number; livePrice: number }[] = [];

    binaryTrades.forEach((t) => {
      if (t.status === 'PENDING' && now >= t.expiry) {
        const priceObj = currentPrices[t.symbol];
        if (!priceObj) return; // Wait until price data is loaded

        const livePrice = priceObj.price;
        // True win condition: price must end in predicted direction
        let isWin = false;
        if (t.side === 'CALL') {
          isWin = livePrice > t.entryPrice;
        } else if (t.side === 'PUT') {
          isWin = livePrice < t.entryPrice;
        }

        const pnl = isWin ? t.amount * 0.85 : -t.amount;
        const payoutValue = isWin ? t.amount * 1.85 : 0;

        binaryBalanceAdjustment += payoutValue;
        expiredTicks.push({
          timestamp: t.timestamp,
          isWin,
          pnl,
          livePrice
        });
        binaryUpdated = true;
      }
    });

    if (binaryUpdated && expiredTicks.length > 0) {
      if (binaryBalanceAdjustment > 0) {
        setBalance(prev => prev + binaryBalanceAdjustment);
      }

      setBinaryTrades(prev => prev.map(t => {
        const et = expiredTicks.find(e => e.timestamp === t.timestamp);
        if (et) {
          return { ...t, status: et.isWin ? 'WIN' : 'LOSS' };
        }
        return t;
      }));

      setTrades(prev => prev.map(th => {
        const et = expiredTicks.find(e => e.timestamp === th.timestamp);
        if (et) {
          return {
            ...th,
            pnl: et.pnl,
            pnlStatus: et.isWin ? 'WIN' : 'LOSS',
            price: et.livePrice
          };
        }
        return th;
      }));
    }
  }, [positions, binaryTrades]);

  const executeBinaryTrade = useCallback((
    symbol: string,
    side: 'CALL' | 'PUT',
    amount: number,
    currentPrice: number,
    durationSeconds: number = 60
  ) => {
    if (balance < amount) {
      return { success: false, message: 'Insufficient balance' };
    }

    const tradeTime = Date.now();
    setBalance(prev => prev - amount);
    const expiry = tradeTime + (durationSeconds * 1000);
    
    // Generate a beautiful, high-fidelity AI success probability (74% to 92%)
    const winChance = Math.floor(Math.random() * 19) + 74;

    const newTrade: BinaryTrade = {
      symbol,
      side,
      amount,
      entryPrice: currentPrice,
      expiry,
      status: 'PENDING',
      timestamp: tradeTime,
      winChance
    };

    setBinaryTrades(prev => [...prev, newTrade]);
    setTrades(prev => [
      { 
        symbol, 
        side, 
        amount, 
        price: currentPrice, 
        timestamp: tradeTime, 
        type: 'BINARY',
        pnlStatus: 'PENDING'
      }, 
      ...prev
    ].slice(0, 50));

    return { success: true, message: `Binary ${side} trade placed for ${symbol}. Expiry in ${durationSeconds}s` };
  }, [balance]);

  const toggleAutoTrading = useCallback((enabled: boolean) => {
    setIsAutoTrading(enabled);
    return { success: true, message: `Auto trading ${enabled ? 'enabled' : 'disabled'}` };
  }, []);

  const adjustBalance = useCallback((amount: number) => {
    setBalance(prev => Math.max(0, prev + amount));
    return { success: true, message: `Balance adjusted by ${amount >= 0 ? '+' : ''}${amount}. New balance: $${(balance + amount).toLocaleString()}` };
  }, [balance]);

  return { 
    balance, 
    positions, 
    binaryTrades, 
    trades, 
    executeTrade, 
    executeBinaryTrade, 
    closePosition,
    isAutoTrading, 
    toggleAutoTrading, 
    adjustBalance,
    autoTradingMode,
    setAutoTradingMode,
    checkTP_SL
  };
}
