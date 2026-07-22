"use client";

import { TextPage } from "@/components/content/content-pages";
import { useLocale } from "@/providers/locale-provider";

const content = {
  tr: {
    eyebrow: "Yasal",
    title: "Çerez politikası",
    intro: "Çerezlerin dil, para birimi ve analiz tercihlerini nasıl desteklediği.",
    sections: [
      { title: "Zorunlu çerezler", body: "Zorunlu çerezler dil, para birimi ve oturum tercihlerinizi korur." },
      { title: "Analiz", body: "Analiz çerezleri isteğe bağlıdır ve bu örnek ortamda yalnızca simüle edilir." },
    ],
  },
  en: {
    eyebrow: "Legal",
    title: "Cookie policy",
    intro: "How cookies support language, currency and analytics preferences.",
    sections: [
      { title: "Essential cookies", body: "Essential cookies retain your language, currency and session preferences." },
      { title: "Analytics", body: "Analytics cookies are optional and are only simulated in this demo environment." },
    ],
  },
  ru: {
    eyebrow: "Правовая информация",
    title: "Политика использования файлов cookie",
    intro: "Как файлы cookie сохраняют настройки языка, валюты и аналитики.",
    sections: [
      { title: "Обязательные файлы cookie", body: "Обязательные файлы cookie сохраняют выбранные язык, валюту и параметры сеанса." },
      { title: "Аналитика", body: "Аналитические файлы cookie необязательны и в этой демонстрационной среде только имитируются." },
    ],
  },
} as const;

export default function Page() {
  const { locale } = useLocale();
  const page = content[locale];
  return (
    <TextPage
      eyebrow={page.eyebrow}
      title={page.title}
      intro={page.intro}
      sections={[...page.sections]}
    />
  );
}
