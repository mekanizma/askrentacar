"use client";

import { TextPage } from "@/components/content/content-pages";
import { useLocale } from "@/providers/locale-provider";

const content = {
  tr: {
    eyebrow: "Yasal",
    title: "Kiralama koşulları",
    intro: "Şeffaf ve premium bir araç kiralama deneyiminin temel koşulları.",
    sections: [
      { title: "Uygunluk", body: "Sürücü en az 21 yaşında olmalı ve en az bir yıllık geçerli sürücü belgesi geçmişine sahip olmalıdır." },
      { title: "Yakıt ve sınır geçişleri", body: "Yakıt paketi seçilmediği sürece dolu depo teslim, dolu depo iade politikası uygulanır. Kuzey Kıbrıs dışına çıkış için yazılı onay gerekir." },
    ],
  },
  en: {
    eyebrow: "Legal",
    title: "Rental terms",
    intro: "Key conditions for a transparent premium rental experience.",
    sections: [
      { title: "Eligibility", body: "The minimum driver age is 21, with at least one year of valid driving history." },
      { title: "Fuel and borders", body: "The fuel policy is full-to-full unless a fuel package is selected. Travel outside Northern Cyprus requires written approval." },
    ],
  },
  ru: {
    eyebrow: "Правовая информация",
    title: "Условия аренды",
    intro: "Основные условия прозрачной аренды автомобиля премиум-класса.",
    sections: [
      { title: "Требования к водителю", body: "Минимальный возраст водителя — 21 год, стаж вождения по действующему удостоверению — не менее одного года." },
      { title: "Топливо и пересечение границ", body: "Если топливный пакет не выбран, действует правило «полный бак при получении — полный бак при возврате». Для выезда за пределы Северного Кипра требуется письменное разрешение." },
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
