import { CurrencyPair } from '../types/signal';

export const INITIAL_CURRENCIES: CurrencyPair[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'Forex', price: 1.0845, change: 0.12, volatility: 'Low', recommended: true, winRate: 97 },
  { symbol: 'GBP/USD', name: 'British Pound / USD', category: 'Forex', price: 1.2910, change: -0.25, volatility: 'Low', recommended: true, winRate: 96 },
  { symbol: 'USD/JPY', name: 'USD / Japanese Yen', category: 'Forex', price: 154.60, change: 0.40, volatility: 'Moderate', recommended: true, winRate: 94 },
  { symbol: 'AUD/USD', name: 'Australian Dollar / USD', category: 'Forex', price: 0.6540, change: 0.18, volatility: 'Low', recommended: true, winRate: 95 },
  { symbol: 'BTC/USDT', name: 'Bitcoin', category: 'Crypto', price: 91450.00, change: 2.45, volatility: 'Moderate', recommended: true, winRate: 95 },
  { symbol: 'ETH/USDT', name: 'Ethereum', category: 'Crypto', price: 3380.50, change: -0.82, volatility: 'Moderate', recommended: true, winRate: 93 },
  { symbol: 'BNB/USDT', name: 'BNB', category: 'Crypto', price: 612.40, change: 1.15, volatility: 'Low', recommended: true, winRate: 98 },
  { symbol: 'SOL/USDT', name: 'Solana', category: 'Crypto', price: 188.20, change: 5.12, volatility: 'High', recommended: false, winRate: 76 },
  { symbol: 'XRP/USDT', name: 'Ripple', category: 'Crypto', price: 2.15, change: -1.30, volatility: 'High', recommended: false, winRate: 74 },
];

export const TIMER_OPTIONS = [
  { label: '5s', seconds: 5 },
  { label: '10s', seconds: 10 },
  { label: '30s', seconds: 30 },
  { label: '1m', seconds: 60 },
  { label: '3m', seconds: 180 },
  { label: '5m', seconds: 300 },
];
