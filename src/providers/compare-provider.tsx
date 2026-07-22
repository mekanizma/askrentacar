"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { STORAGE_KEYS } from "@/constants";
import { useLocale } from "@/providers/locale-provider";

interface CompareContextValue {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const { locale } = useLocale();
  const messages = useMemo(() => ({
    tr: {
      limit: "En fazla 3 aracı karşılaştırabilirsiniz",
      added: "Karşılaştırma listesine eklendi",
    },
    en: {
      limit: "You can compare up to 3 vehicles",
      added: "Added to compare",
    },
    ru: {
      limit: "Можно сравнить не более 3 автомобилей",
      added: "Добавлено к сравнению",
    },
  })[locale], [locale]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.compare);
    if (raw) setIds(JSON.parse(raw) as string[]);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.compare, JSON.stringify(ids));
  }, [ids]);

  const value = useMemo(
    () => ({
      ids,
      has: (id: string) => ids.includes(id),
      clear: () => setIds([]),
      toggle: (id: string) => {
        setIds((prev) => {
          if (prev.includes(id)) return prev.filter((x) => x !== id);
          if (prev.length >= 3) {
            toast.error(messages.limit);
            return prev;
          }
          toast.success(messages.added);
          return [...prev, id];
        });
      },
    }),
    [ids, messages],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
