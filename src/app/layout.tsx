import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { BRAND } from "@/constants";
import "./globals.css";

const sans = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.domain),
  title: {
    default: "ASK RENT A CAR | KKTC Premium Araç Kiralama",
    template: "%s | ASK RENT A CAR",
  },
  description:
    "Ercan Havalimanı, Girne, Lefkoşa ve tüm Kuzey Kıbrıs'ta premium araç kiralama. Lüks, SUV, elektrikli ve aile araçları.",
  openGraph: {
    title: "ASK RENT A CAR",
    description: "Kuzey Kıbrıs'ta premium araç kiralama",
    url: BRAND.domain,
    siteName: BRAND.name,
    locale: "en_GB",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: BRAND.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ASK RENT A CAR",
    description: "Kuzey Kıbrıs'ta premium araç kiralama",
    images: ["/logo.png"],
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  alternates: {
    canonical: BRAND.domain,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: BRAND.name,
    url: BRAND.domain,
    telephone: BRAND.phone,
    email: BRAND.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kyrenia",
      addressCountry: "CY",
    },
    areaServed: "Northern Cyprus",
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
        </AppProviders>
      </body>
    </html>
  );
}
