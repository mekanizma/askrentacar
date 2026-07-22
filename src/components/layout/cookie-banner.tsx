"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/constants";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.cookieConsent);
    if (!saved) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur md:inset-x-auto">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-300">
          {t("cookie.message")}{" "}
          <a href="/cookies" className="text-gold underline">
            {t("cookie.policy")}
          </a>
          .
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              localStorage.setItem(STORAGE_KEYS.cookieConsent, "rejected");
              setVisible(false);
            }}
          >
            {t("cookie.reject")}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              localStorage.setItem(STORAGE_KEYS.cookieConsent, "accepted");
              setVisible(false);
            }}
          >
            {t("cookie.accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
