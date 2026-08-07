export type SignalType = 'CALL' | 'PUT';
export type AccuracyMode = 'STANDARD' | 'ULTRA_CONFLUENCE';

export interface CurrencyPair {
  symbol: string;
  name: string;
  category: 'Crypto' | 'Forex';
  price: number;
  change: number;
  volatility: 'Low' | 'Moderate' | 'High';
  recommended: boolean;
  winRate: number;
  icon?: string;
}

export interface TechnicalIndicator {
  name: string;
  status: 'CONFIRMED' | 'STRONG';
  value: string;
}

export interface SignalResult {
  id: string;
  symbol: string;
  type: SignalType;
  confidence: number;
  successRate: number;
  volatility: 'Low' | 'Moderate' | 'High';
  entryPrice: number;
  timerSeconds: number;
  reason: string;
  accuracyMode: AccuracyMode;
  indicators: TechnicalIndicator[];
  timestamp: number;
}

export interface TradeHistoryItem {
  id: string;
  symbol: string;
  type: SignalType;
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  timerSeconds: number;
  status: 'PENDING' | 'WIN' | 'LOSS';
  profit: number;
  timestamp: number;
}
