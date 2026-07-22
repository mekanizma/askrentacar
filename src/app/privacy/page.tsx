"use client";

import { TextPage } from "@/components/content/content-pages";
import { useLocale } from "@/providers/locale-provider";

const content = {
  tr: {
    eyebrow: "Yasal",
    title: "Gizlilik politikası",
    intro: "ASK RENT A CAR’ın bu demoda ve üretim ortamında misafir bilgilerini nasıl işlediği.",
    sections: [
      { title: "Demo modu", body: "Mevcut demoda veriler, localStorage tabanlı örnek veritabanı aracılığıyla tarayıcınızda saklanır." },
      { title: "Üretim ortamı", body: "Gelecekteki Supabase kurulumu, satır düzeyi güvenlik (RLS) ve şifrelenmiş gizli bilgi yönetimi kullanacaktır." },
    ],
  },
  en: {
    eyebrow: "Legal",
    title: "Privacy policy",
    intro: "How ASK RENT A CAR handles guest information in this demo and in production.",
    sections: [
      { title: "Demo mode", body: "In the current demo, data is stored in your browser through a localStorage-based mock database." },
      { title: "Production environment", body: "A future Supabase deployment will enforce row-level security (RLS) and encrypted secrets management." },
    ],
  },
  ru: {
    eyebrow: "Правовая информация",
    title: "Политика конфиденциальности",
    intro: "Как ASK RENT A CAR обрабатывает данные клиентов в демоверсии и рабочей среде.",
    sections: [
      { title: "Демонстрационный режим", body: "В текущей демоверсии данные хранятся в вашем браузере в тестовой базе на основе localStorage." },
      { title: "Рабочая среда", body: "Будущее развёртывание Supabase будет использовать защиту на уровне строк (RLS) и зашифрованное управление секретами." },
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
