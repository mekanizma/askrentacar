"use client";

import { Suspense } from "react";
import { useLocale } from "@/providers/locale-provider";
import BookingWizard from "./booking-wizard";

const loadingText = {
  en: "Loading booking…",
  tr: "Rezervasyon yükleniyor…",
  ru: "Бронирование загружается…",
} as const;

export default function BookingPage() {
  const { locale } = useLocale();
  const language = locale === "tr" || locale === "ru" ? locale : "en";

  return (
    <div className="container-premium pb-20 pt-28">
      <Suspense
        fallback={
          <div className="glass rounded-3xl p-5 sm:p-8" role="status" aria-live="polite">
            {loadingText[language]}
          </div>
        }
      >
        <BookingWizard />
      </Suspense>
    </div>
  );
}
