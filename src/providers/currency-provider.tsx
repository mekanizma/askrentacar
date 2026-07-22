"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CURRENCIES, DEFAULT_CURRENCY, STORAGE_KEYS } from "@/constants";
import type { CurrencyCode } from "@/types";
import { formatCurrency } from "@/utils/format";
import { useLocale } from "@/providers/locale-provider";
import { contentService } from "@/services";

const CURRENCY_SYMBOLS = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.symbol]),
) as Record<CurrencyCode, string>;

export const FALLBACK_RATES: Record<CurrencyCode, number> = {
  EUR: 1,
  GBP: 0.86,
  TRY: 36.5,
};

interface CurrencyContextValue {
  currency: CurrencyCode;
  currencySymbol: string;
  rates: Record<CurrencyCode, number>;
  setCurrency: (currency: CurrencyCode) => void;
  convertFromEur: (amountEur: number) => number;
  format: (amountEur: number) => string;
  convertFrom: (amount: number, sourceCurrency: CurrencyCode) => number;
  formatFrom: (amount: number, sourceCurrency: CurrencyCode) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function normalizeRates(
  input?: Partial<Record<CurrencyCode, number>> | null,
): Record<CurrencyCode, number> {
  const eur = Number(input?.EUR);
  const gbp = Number(input?.GBP);
  const tryRate = Number(input?.TRY);
  return {
    EUR: eur > 0 ? eur : FALLBACK_RATES.EUR,
    GBP: gbp > 0 ? gbp : FALLBACK_RATES.GBP,
    TRY: tryRate > 0 ? tryRate : FALLBACK_RATES.TRY,
  };
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => contentService.settings(),
    staleTime: 60_000,
  });

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

  const rates = useMemo(
    () => normalizeRates(settings?.exchangeRates),
    [settings?.exchangeRates],
  );

  const value = useMemo(
    () => ({
      currency,
      currencySymbol: CURRENCY_SYMBOLS[currency] || "€",
      rates,
      setCurrency,
      convertFromEur: (amountEur: number) =>
        amountEur * (rates[currency] || 1),
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
    }),
    [currency, locale, rates],
  );

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
