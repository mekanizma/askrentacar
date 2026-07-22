import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";
import { BRAND } from "@/constants";

export const metadata: Metadata = {
  title: {
    absolute: BRAND.seo.title,
  },
  description: BRAND.seo.description,
  keywords: [...BRAND.seo.keywords],
  alternates: { canonical: BRAND.domain },
  openGraph: {
    title: BRAND.seo.title,
    description: BRAND.seo.description,
    url: BRAND.domain,
  },
};

export default function Page() {
  return <HomePage />;
}
