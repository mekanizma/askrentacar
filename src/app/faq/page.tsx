"use client";

import { TextPage } from "@/components/content/content-pages";
import { useLocale } from "@/providers/locale-provider";

const content = {
  tr: {
    eyebrow: "SSS",
    title: "Sıkça sorulan sorular",
    intro: "Kuzey Kıbrıs’ta prestijli bir araç teslim almadan önce misafirlerimizin en sık sorduğu sorular.",
    sections: [
      { title: "Hangi belgelere ihtiyacım var?", body: "Geçerli sürücü belgesi (rezervasyon sırasında ön ve arka yüz fotoğrafı yüklenir), pasaport/kimlik ve depozito için kredi veya banka kartı gerekir." },
      { title: "Aracı Ercan Havalimanı’ndan teslim alabilir miyim?", body: "Evet. Onaylanmış tüm rezervasyonlarda karşılama ve teslim hizmeti sunulur." },
      { title: "Hangi para birimleri destekleniyor?", body: "TRY, GBP ve EUR desteklenir; dönüşümlerde güncel örnek kurlar kullanılır." },
    ],
  },
  en: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    intro: "Everything guests usually ask before picking up a vehicle in Northern Cyprus.",
    sections: [
      { title: "What documents do I need?", body: "A valid driving licence (front and back photos uploaded during booking), passport or ID, and a credit or debit card for the deposit." },
      { title: "Can I pick up at Ercan Airport?", body: "Yes. Meet-and-greet service is available for all confirmed bookings." },
      { title: "Which currencies are supported?", body: "TRY, GBP and EUR are supported, using current sample conversion rates." },
    ],
  },
  ru: {
    eyebrow: "Частые вопросы",
    title: "Часто задаваемые вопросы",
    intro: "Ответы на основные вопросы перед получением престижного автомобиля на Северном Кипре.",
    sections: [
      { title: "Какие документы нужны?", body: "Действующее водительское удостоверение (при бронировании загружаются фото лицевой и оборотной стороны), паспорт или удостоверение личности, а также кредитная или дебетовая карта для залога." },
      { title: "Можно ли получить автомобиль в аэропорту Эрджан?", body: "Да. Для всех подтверждённых бронирований доступна услуга встречи и передачи автомобиля." },
      { title: "Какие валюты поддерживаются?", body: "Поддерживаются TRY, GBP и EUR с использованием актуальных демонстрационных курсов." },
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
