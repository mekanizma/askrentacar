"use client";

import { TextPage } from "@/components/content/content-pages";
import { useLocale } from "@/providers/locale-provider";

export default function Page() {
  const { locale } = useLocale();
  const content = {
    tr: {
      eyebrow: "Hakkımızda",
      title: "Kuzey Kıbrıs için özenle tasarlandı",
      intro:
        "ASK RENT A CAR; kusursuz dijital deneyimi, premium misafirperverliği ve modern araç teknolojilerini bir araya getiren seçkin bir kiralama markasıdır.",
      sections: [
        {
          title: "Hizmet sözümüz",
          body: "Ercan Havalimanı'ndan Girne Limanı'na kadar her araç teslimi ayrıntılı kontroller, şeffaf sigorta seçenekleri ve çok dilli destekle hazırlanır.",
        },
        {
          title: "Geleceğe hazır altyapı",
          body: "Bugün örnek veri katmanıyla çalışan sistem, müşteri deneyimi değişmeden Supabase kimlik doğrulama, depolama ve gerçek zamanlı servislere geçirilebilir.",
        },
      ],
    },
    en: {
      eyebrow: "About",
      title: "Crafted for Northern Cyprus",
      intro:
        "ASK RENT A CAR brings together a polished digital experience, premium hospitality and modern vehicle technology.",
      sections: [
        {
          title: "Our promise",
          body: "From Ercan Airport to Kyrenia Harbour, every handover is prepared with detailed inspections, transparent insurance and multilingual support.",
        },
        {
          title: "Future-ready architecture",
          body: "The mock-first platform can move to Supabase authentication, storage and realtime services without changing the customer journey.",
        },
      ],
    },
    ru: {
      eyebrow: "О нас",
      title: "Создано для Северного Кипра",
      intro:
        "ASK RENT A CAR объединяет безупречный цифровой сервис, премиальное гостеприимство и современные автомобильные технологии.",
      sections: [
        {
          title: "Наше обещание",
          body: "От аэропорта Эрджан до гавани Кирении каждая выдача включает тщательную проверку, прозрачную страховку и многоязычную поддержку.",
        },
        {
          title: "Готовая к развитию архитектура",
          body: "Платформу можно перевести на Supabase Auth, Storage и Realtime без изменения пользовательского пути.",
        },
      ],
    },
  }[locale];

  return (
    <TextPage
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
      sections={content.sections}
    />
  );
}
