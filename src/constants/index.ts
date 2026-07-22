import type { CurrencyCode, LocaleCode } from "@/types";

export const BRAND = {
  name: "ASK RENT A CAR",
  shortName: "ASK RENT A CAR",
  tagline: "Girne - KKTC Premium Araç, Motorsiklet Kiralama",
  phone: "+90 392 815 00 00",
  whatsapp: "+905338881122",
  email: "info@askrentacar.com",
  domain: "https://askrentacar.com",
  address: {
    locality: "Girne",
    region: "KKTC",
    country: "CY",
    countryName: "Kuzey Kıbrıs",
  },
  geo: {
    latitude: 35.3417,
    longitude: 33.3167,
  },
  seo: {
    title:
      "Girne Rent a Car | Kiralık Araç Girne · Motor & Bike Kiralama KKTC",
    description:
      "Girne rent a car, kiralık araç Girne, Girne motor kiralama ve Girne rent a bike hizmeti. KKTC Girne'de havalimanı teslimatlı premium araç, motor ve bisiklet kiralama.",
    keywords: [
      "kiralık araç girne",
      "rent a car girne",
      "girne rent a car",
      "girne motor kiralama",
      "girne rent a bike",
      "kktc girne",
      "girne araç kiralama",
      "kuzey kıbrıs rent a car",
      "ercan havalimanı araç kiralama",
      "kyrenia car rental",
    ],
  },
} as const;

export const LOCALES: { code: LocaleCode; label: string; flag: string }[] = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

export const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: "TRY", label: "TL", symbol: "₺" },
  { code: "GBP", label: "GBP", symbol: "£" },
  { code: "EUR", label: "EUR", symbol: "€" },
];

export const DEFAULT_LOCALE: LocaleCode = "tr";
export const DEFAULT_CURRENCY: CurrencyCode = "EUR";

export const MOCK_LATENCY_MS = 0;
export const STORAGE_KEYS = {
  db: "ask_mock_db_v2",
  session: "ask_session_v1",
  compare: "ask_compare_v1",
  locale: "ask_locale_v1",
  currency: "ask_currency_v1",
  cookieConsent: "ask_cookie_v1",
} as const;

export const CATEGORY_SLUGS = [
  "economy",
  "suv",
  "luxury",
  "electric",
  "convertible",
  "family",
  "sports",
  "commercial",
  "premium",
  "crossover",
] as const;

export const NAV_LINKS = [
  { href: "/vehicles", labelKey: "nav.fleet" },
  { href: "/contact", labelKey: "nav.contact" },
] as const;
