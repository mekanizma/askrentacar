import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { BRAND } from "@/constants";
import "./globals.css";

const sans = Inter({
  subsets: ["latin", "cyrillic", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.domain),
  title: {
    default: BRAND.seo.title,
    template: "%s | ASK RENT A CAR Girne",
  },
  description: BRAND.seo.description,
  keywords: [...BRAND.seo.keywords],
  applicationName: BRAND.name,
  authors: [{ name: BRAND.name, url: BRAND.domain }],
  creator: BRAND.name,
  publisher: BRAND.name,
  category: "travel",
  openGraph: {
    title: BRAND.seo.title,
    description: BRAND.seo.description,
    url: BRAND.domain,
    siteName: BRAND.name,
    locale: "tr_TR",
    alternateLocale: ["en_GB", "ru_RU"],
    type: "website",
    images: [{ url: BRAND.logoSrc, width: 1024, height: 1024, alt: BRAND.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.seo.title,
    description: BRAND.seo.description,
    images: [BRAND.logoSrc],
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  alternates: {
    canonical: BRAND.domain,
    languages: {
      tr: BRAND.domain,
      en: BRAND.domain,
      ru: BRAND.domain,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": "CY-01",
    "geo.placename": "Girne, KKTC",
    "geo.position": `${BRAND.geo.latitude};${BRAND.geo.longitude}`,
    ICBM: `${BRAND.geo.latitude}, ${BRAND.geo.longitude}`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["AutoRental", "LocalBusiness"],
        "@id": `${BRAND.domain}/#business`,
        name: BRAND.name,
        url: BRAND.domain,
        image: `${BRAND.domain}${BRAND.logo}`,
        logo: `${BRAND.domain}${BRAND.logo}`,
        telephone: BRAND.phone,
        email: BRAND.email,
        priceRange: "€€",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Girne",
          addressRegion: "KKTC",
          addressCountry: "CY",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: BRAND.geo.latitude,
          longitude: BRAND.geo.longitude,
        },
        areaServed: [
          { "@type": "City", name: "Girne" },
          { "@type": "City", name: "Kyrenia" },
          { "@type": "AdministrativeArea", name: "Kuzey Kıbrıs" },
          { "@type": "AdministrativeArea", name: "KKTC" },
        ],
        knowsAbout: [
          "Kiralık araç Girne",
          "Girne rent a car",
          "Girne motor kiralama",
          "Girne rent a bike",
          "KKTC Girne araç kiralama",
        ],
        sameAs: [
          `https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`,
        ],
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "08:00",
          closes: "22:00",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${BRAND.domain}/#website`,
        url: BRAND.domain,
        name: BRAND.name,
        inLanguage: ["tr", "en", "ru"],
        publisher: { "@id": `${BRAND.domain}/#business` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${BRAND.domain}/vehicles?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${BRAND.domain}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Girne'de kiralık araç nasıl alınır?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "ASK RENT A CAR üzerinden online rezervasyon veya WhatsApp ile Girne rent a car talebi oluşturabilirsiniz. Otel, liman veya Ercan Havalimanı teslimi mümkündür.",
            },
          },
          {
            "@type": "Question",
            name: "Girne motor kiralama ve rent a bike var mı?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Evet. KKTC Girne'de araç kiralamanın yanında motor kiralama ve bisiklet/mobilite seçenekleri de sunuyoruz.",
            },
          },
          {
            "@type": "Question",
            name: "KKTC Girne dışında teslim yapıyor musunuz?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Girne merkezli olmakla birlikte Lefkoşa ve Ercan Havalimanı dahil Kuzey Kıbrıs genelinde teslim noktası seçenekleri mevcuttur.",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="tr" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppProviders>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
          <CookieBanner />
          <WhatsAppFloat />
        </AppProviders>
      </body>
    </html>
  );
}
