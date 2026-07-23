"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  Menu,
  Phone,
  MessageCircle,
  X,
  Globe2,
  Coins,
  UserRound,
} from "lucide-react";
import { BRAND, CURRENCIES, LOCALES, NAV_LINKS } from "@/constants";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";
import { useCurrency } from "@/providers/currency-provider";
import { cn } from "@/utils/cn";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t, locale, setLocale } = useLocale();
  const { currency, setCurrency } = useCurrency();
  const { user, logout } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-[100] px-2 pt-2 sm:px-3">
      <div className="container-premium">
        <div className="relative flex h-[4.25rem] items-center justify-between gap-3 overflow-visible rounded-2xl border border-white/[0.12] bg-slate-950/90 px-3 shadow-[0_16px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl supports-[backdrop-filter]:bg-slate-950/75 md:h-[5rem] md:px-4">
          <span className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
          <Link
            href="/"
            className="focus-ring relative -my-1 flex h-14 w-14 shrink-0 items-center sm:h-[4.25rem] sm:w-[4.25rem] md:h-[4.75rem] md:w-[4.75rem]"
            aria-label={BRAND.name}
          >
            <span className="pointer-events-none absolute left-0 top-1/2 h-[7.5rem] w-[7.5rem] -translate-y-1/2 sm:h-[9rem] sm:w-[9rem] md:h-[10rem] md:w-[10rem]">
              <Image
                src={BRAND.logoSrc}
                alt={BRAND.name}
                fill
                priority
                sizes="(max-width: 640px) 120px, (max-width: 768px) 144px, 160px"
                className="object-contain object-left drop-shadow-[0_4px_18px_rgba(200,169,106,0.35)]"
              />
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.035] p-1 lg:flex"
            aria-label={t("header.mainMenu")}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "focus-ring rounded-full px-4 py-2 text-sm font-medium transition",
                  pathname === link.href || pathname.startsWith(`${link.href}/`)
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-slate-300 hover:bg-white/[0.07] hover:text-white",
                )}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href={`tel:${BRAND.phone}`}
              className="focus-ring hidden rounded-full border border-white/[0.08] bg-white/[0.04] p-2.5 text-slate-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white xl:inline-flex"
              aria-label={t("header.phone")}
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="focus-ring hidden rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] p-2.5 text-emerald-400 transition hover:bg-emerald-400/15 xl:inline-flex"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>

            <label className="sr-only" htmlFor="locale">
              {t("header.language")}
            </label>
            <div className="relative hidden sm:block">
              <Globe2 className="pointer-events-none absolute left-2.5 top-2.5 z-10 h-4 w-4 text-blue-300" />
              <select
                id="locale"
                value={locale}
                onChange={(e) => setLocale(e.target.value as typeof locale)}
                className="h-9 w-[112px] cursor-pointer appearance-none rounded-full border border-white/15 bg-slate-900 pl-8 pr-7 text-xs font-semibold text-white shadow-inner outline-none [color-scheme:dark] hover:border-blue-400/40 focus:border-blue-400"
              >
                {LOCALES.map((l) => (
                  <option
                    key={l.code}
                    value={l.code}
                    className="bg-slate-950 text-white"
                  >
                    {l.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3 w-3 text-slate-300" />
            </div>

            <div className="relative hidden sm:block">
              <Coins className="pointer-events-none absolute left-2.5 top-2.5 z-10 h-4 w-4 text-gold" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as typeof currency)}
                className="h-9 w-[92px] cursor-pointer appearance-none rounded-full border border-white/15 bg-slate-900 pl-8 pr-7 text-xs font-semibold text-white shadow-inner outline-none [color-scheme:dark] hover:border-gold/50 focus:border-gold"
                aria-label={t("header.currency")}
              >
                {CURRENCIES.map((c) => (
                  <option
                    key={c.code}
                    value={c.code}
                    className="bg-slate-950 text-white"
                  >
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3 w-3 text-slate-300" />
            </div>

            {user ? (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/account">
                  <Button variant="secondary" size="sm">
                    <UserRound className="h-4 w-4" /> {t("nav.account")}
                  </Button>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="gold" size="sm">
                      {t("nav.admin")}
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  {t("nav.logout")}
                </Button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">{t("nav.register")}</Button>
                </Link>
              </div>
            )}

            <button
              className="focus-ring inline-flex rounded-full border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={t("header.toggleMenu")}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="container-premium mt-2 lg:hidden">
          <div className="flex max-h-[calc(100vh-6rem)] flex-col gap-2 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-2xl">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-3 font-medium",
                  pathname === link.href
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/10",
                )}
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-slate-400">
                {t("header.language")}
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as typeof locale)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-white/15 bg-slate-900 px-3 text-sm font-semibold text-white [color-scheme:dark]"
                >
                  {LOCALES.map((l) => (
                    <option
                      key={l.code}
                      value={l.code}
                      className="bg-slate-950 text-white"
                    >
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-slate-400">
                {t("header.currency")}
                <select
                  value={currency}
                  onChange={(e) =>
                    setCurrency(e.target.value as typeof currency)
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-white/15 bg-slate-900 px-3 text-sm font-semibold text-white [color-scheme:dark]"
                >
                  {CURRENCIES.map((c) => (
                    <option
                      key={c.code}
                      value={c.code}
                      className="bg-slate-950 text-white"
                    >
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {user ? (
              <>
                <Link href="/account" onClick={() => setOpen(false)}>
                  <Button className="w-full">{t("nav.account")}</Button>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" onClick={() => setOpen(false)}>
                    <Button variant="gold" className="w-full">
                      {t("nav.admin")}
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full">{t("nav.register")}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
