'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyCode, SUPPORTED_CURRENCIES, CurrencyConfig } from '@/types/product';

interface CurrencyContextType {
  currentCurrency: CurrencyCode;
  currencyConfig: CurrencyConfig;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (priceUsd: number) => string;
  convertPrice: (priceUsd: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>('USD');

  // Load user saved currency from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('arielmc_currency') as CurrencyCode | null;
      if (saved && SUPPORTED_CURRENCIES[saved]) {
        setCurrentCurrency(saved);
      }
    } catch {
      // Local storage unavailable or restricted
    }
  }, []);

  const handleSetCurrency = (code: CurrencyCode) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrentCurrency(code);
      try {
        localStorage.setItem('arielmc_currency', code);
      } catch {
        // Ignore
      }
    }
  };

  const currencyConfig = SUPPORTED_CURRENCIES[currentCurrency];

  const convertPrice = (priceUsd: number): number => {
    const converted = priceUsd * currencyConfig.rateFromUsd;
    // Round to 2 decimals for values under 100, or whole numbers for higher values
    return converted >= 100 ? Math.round(converted) : Math.round(converted * 10) / 10;
  };

  const formatPrice = (priceUsd: number): string => {
    const val = convertPrice(priceUsd);
    return `${currencyConfig.symbol}${val.toLocaleString('en-US')}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        currencyConfig,
        setCurrency: handleSetCurrency,
        formatPrice,
        convertPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      currentCurrency: 'USD' as CurrencyCode,
      currencyConfig: SUPPORTED_CURRENCIES.USD,
      setCurrency: () => {},
      formatPrice: (p: number) => `$${p}`,
      convertPrice: (p: number) => p,
    };
  }
  return context;
}

