"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND, NAV_LINKS } from "@/constants";
import { useLocale } from "@/providers/locale-provider";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="mt-14 border-t border-white/10 bg-black/30 sm:mt-16">
      <div className="container-premium grid gap-6 py-8 sm:grid-cols-3 sm:gap-8 sm:py-9">
        <div className="space-y-2">
          <div className="relative h-14 w-14 sm:h-16 sm:w-16">
            <Image
              src="/logo.png"
              alt={BRAND.name}
              fill
              sizes="64px"
              className="object-contain object-left"
            />
          </div>
          <p className="text-xs leading-5 text-slate-400">{BRAND.tagline}</p>
          <p className="text-xs text-slate-400">{BRAND.email}</p>
          <p className="text-xs text-slate-400">{BRAND.phone}</p>
        </div>
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gold">
            {t("footer.explore")}
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-slate-300">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white">
                {t(l.labelKey)}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gold">
            {t("footer.support")}
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-slate-300">
            <Link href="/faq">{t("footer.faq")}</Link>
            <Link href="/terms">{t("footer.terms")}</Link>
            <Link href="/privacy">{t("footer.privacy")}</Link>
            <Link href="/cookies">{t("footer.cookies")}</Link>
            <Link href="/compare">{t("footer.compare")}</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-3 text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()}{" "}
        <a
          href="https://www.mekanizma.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-slate-300 transition hover:text-gold"
        >
          MEKANİZMA
        </a>
        . {t("footer.rights")}
      </div>
    </footer>
  );
}
