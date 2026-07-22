import type { CurrencyCode, LocaleCode } from "@/types";

const localeMap: Record<LocaleCode, string> = {
  tr: "tr-TR",
  en: "en-GB",
  ru: "ru-RU",
};

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "EUR",
  locale: LocaleCode = "tr",
) {
  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(
  value: string | Date,
  locale: LocaleCode = "tr",
  options?: Intl.DateTimeFormatOptions,
) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(localeMap[locale], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

export function formatNumber(value: number, locale: LocaleCode = "tr") {
  return new Intl.NumberFormat(localeMap[locale]).format(value);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function daysBetween(start: string | Date, end: string | Date) {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return Math.max(1, Math.ceil((b - a) / (1000 * 60 * 60 * 24)));
}
