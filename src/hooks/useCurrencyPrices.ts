import { useState, useEffect } from 'react';
import { CurrencyPair } from '../types/signal';
import { INITIAL_CURRENCIES } from '../data/currencies';

export function useCurrencyPrices() {
  const [currencies, setCurrencies] = useState<CurrencyPair[]>(INITIAL_CURRENCIES);

  useEffect(() => {
    // Simulate live market price ticks
    const interval = setInterval(() => {
      setCurrencies((prev) =>
        prev.map((c) => {
          const deltaPercent = (Math.random() - 0.49) * 0.003;
          const newPrice = Math.max(0.0001, c.price * (1 + deltaPercent));
          const decimals = c.category === 'Forex' ? 4 : c.price > 100 ? 2 : 4;
          return {
            ...c,
            price: Number(newPrice.toFixed(decimals)),
            change: Number((c.change + (Math.random() - 0.5) * 0.1).toFixed(2)),
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return currencies;
}
