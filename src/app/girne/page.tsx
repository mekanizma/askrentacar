import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/constants";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Girne Rent a Car | Kiralık Araç, Motor ve Bike Kiralama KKTC",
  description:
    "Girne rent a car, kiralık araç Girne, Girne motor kiralama ve Girne rent a bike. KKTC Girne'de güvenilir teslimat ve uygun fiyatlı kiralama.",
  keywords: [...BRAND.seo.keywords],
  alternates: { canonical: `${BRAND.domain}/girne` },
  openGraph: {
    title: "Girne Rent a Car · ASK RENT A CAR",
    description:
      "KKTC Girne'de araç, motor ve bisiklet kiralama. Ercan Havalimanı teslimat seçenekleri.",
    url: `${BRAND.domain}/girne`,
    locale: "tr_TR",
    type: "website",
  },
};

const services = [
  {
    href: "/vehicles",
    title: "Kiralık Araç Girne",
    text: "Ekonomiden lüks sınıfa Girne rent a car seçenekleri. Günlük, haftalık ve aylık kiralama.",
  },
  {
    href: "/vehicles?category=sports",
    title: "Girne Motor Kiralama",
    text: "Şehir içi ve sahil rotaları için pratik motor kiralama. KKTC Girne'de hızlı teslim.",
  },
  {
    href: "/vehicles",
    title: "Girne Rent a Bike",
    text: "Kısa mesafeler ve sahil turları için bisiklet / scooter tarzı mobilite çözümleri.",
  },
];

export default function GirneSeoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Girne Rent a Car",
    provider: {
      "@type": "AutoRental",
      name: BRAND.name,
      url: BRAND.domain,
      telephone: BRAND.phone,
    },
    areaServed: [
      { "@type": "City", name: "Girne" },
      { "@type": "AdministrativeArea", name: "KKTC" },
    ],
    serviceType: [
      "Kiralık araç Girne",
      "Girne motor kiralama",
      "Girne rent a bike",
      "KKTC Girne rent a car",
    ],
  };

  return (
    <div className="container-premium space-y-10 pb-20 pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="max-w-3xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
          KKTC · Girne
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
          Girne Rent a Car — Kiralık Araç, Motor ve Bike Kiralama
        </h1>
        <p className="text-base leading-7 text-slate-300 sm:text-lg">
          ASK RENT A CAR ile <strong>kiralık araç Girne</strong>,{" "}
          <strong>Girne motor kiralama</strong> ve{" "}
          <strong>Girne rent a bike</strong> ihtiyaçlarınızı tek noktadan
          karşılayın. <strong>KKTC Girne</strong> merkezli filomuz; otel,
          liman ve Ercan Havalimanı teslim seçenekleriyle yanınızda.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/vehicles">
            <Button className="w-full sm:w-auto">Araçları İncele</Button>
          </Link>
          <Link href="/booking">
            <Button variant="secondary" className="w-full sm:w-auto">
              Rezervasyon Yap
            </Button>
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="glass rounded-3xl p-5 transition hover:border-gold/30"
          >
            <h2 className="text-xl font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{item.text}</p>
          </Link>
        ))}
      </section>

      <section className="glass space-y-4 rounded-3xl p-5 sm:p-8">
        <h2 className="text-2xl font-semibold">Neden Girne&apos;de ASK RENT A CAR?</h2>
        <ul className="space-y-3 text-sm leading-6 text-slate-300">
          <li>
            · Google&apos;da aranan <em>Girne rent a car</em> ve{" "}
            <em>kiralık araç Girne</em> taleplerine uygun güncel filo
          </li>
          <li>· Şeffaf fiyat, online rezervasyon ve WhatsApp destek</li>
          <li>· KKTC Girne, Lefkoşa ve Ercan hattında esnek teslim noktaları</li>
          <li>· Motor ve bisiklet tarzı kısa mesafe seçenekleri</li>
        </ul>
      </section>
    </div>
  );
}
