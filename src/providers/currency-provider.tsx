"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CURRENCIES, DEFAULT_CURRENCY, STORAGE_KEYS } from "@/constants";
import type { CurrencyCode } from "@/types";
import { formatCurrency } from "@/utils/format";
import { useLocale } from "@/providers/locale-provider";

const CURRENCY_SYMBOLS = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.symbol]),
) as Record<CurrencyCode, string>;

const DEFAULT_RATES: Record<CurrencyCode, number> = {
  EUR: 1,
  GBP: 0.86,
  TRY: 36.5,
};

interface CurrencyContextValue {
  currency: CurrencyCode;
  currencySymbol: string;
  setCurrency: (currency: CurrencyCode) => void;
  convertFromEur: (amountEur: number) => number;
  format: (amountEur: number) => string;
  convertFrom: (amount: number, sourceCurrency: CurrencyCode) => number;
  formatFrom: (amount: number, sourceCurrency: CurrencyCode) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    const saved = localStorage.getItem(
      STORAGE_KEYS.currency,
    ) as CurrencyCode | null;
    if (saved) setCurrencyState(saved);
  }, []);

  const setCurrency = (next: CurrencyCode) => {
    setCurrencyState(next);
    localStorage.setItem(STORAGE_KEYS.currency, next);
  };

  const value = useMemo(() => {
    const rates = DEFAULT_RATES;
    return {
      currency,
      currencySymbol: CURRENCY_SYMBOLS[currency] || "€",
      setCurrency,
      convertFromEur: (amountEur: number) => amountEur * (rates[currency] || 1),
      format: (amountEur: number) =>
        formatCurrency(amountEur * (rates[currency] || 1), currency, locale),
      convertFrom: (amount: number, sourceCurrency: CurrencyCode) =>
        (amount / (rates[sourceCurrency] || 1)) * (rates[currency] || 1),
      formatFrom: (amount: number, sourceCurrency: CurrencyCode) =>
        formatCurrency(
          (amount / (rates[sourceCurrency] || 1)) * (rates[currency] || 1),
          currency,
          locale,
        ),
    };
  }, [currency, locale]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
