"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Copy,
  MessageCircle,
} from "lucide-react";
import { ReservationSearch } from "@/components/forms/reservation-search";
import { VehicleCard } from "@/components/cards/vehicle-card";
import { Button } from "@/components/ui/button";
import { Card, Skeleton } from "@/components/ui/primitives";
import { useCampaigns, useVehicles } from "@/hooks/use-data";
import { useCurrency } from "@/providers/currency-provider";
import { useLocale } from "@/providers/locale-provider";
import { localize } from "@/services";
import { BRAND } from "@/constants";

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=75";

export function HomePage() {
  const { t, locale } = useLocale();
  const { formatFrom } = useCurrency();
  const { data: featured, isLoading } = useVehicles({
    featured: true,
    pageSize: 6,
  });
  const { data: campaigns } = useCampaigns();
  const heroVehicle = featured?.data[0];
  const heroImage = heroVehicle?.images[0]?.url ?? HERO_FALLBACK;
  const whatsappHref = `https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    t("hero.whatsappMessage"),
  )}`;
  const activeCampaigns = (campaigns ?? [])
    .filter((campaign) => {
      const now = Date.now();
      return (
        campaign.active &&
        new Date(campaign.startsAt).getTime() <= now &&
        new Date(campaign.endsAt).getTime() >= now
      );
    })
    .slice(0, 3);

  return (
    <div>
      <section className="relative min-h-[100svh] overflow-hidden pb-12 pt-28 md:pb-16 md:pt-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.055]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.22) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        <div
          className="pointer-events-none absolute -left-32 top-8 h-[36rem] w-[36rem] rounded-full bg-blue-600/15 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-40 top-0 h-[42rem] w-[42rem] rounded-full bg-gold/10 blur-[140px]"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />

        <div className="container-premium relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] xl:gap-16">
            <div className="relative animate-fade-up">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-gold" />
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold sm:text-sm">
                  {t("home.region")}
                </p>
              </div>
              <h1 className="max-w-3xl text-[2.65rem] font-semibold leading-[1.03] tracking-[-0.045em] text-white sm:text-5xl md:text-6xl xl:text-7xl">
                {t("hero.title")}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
                {t("hero.subtitle")}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/vehicles" className="sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t("hero.cta")}
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp-soft focus-ring group inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-5 text-sm font-medium text-slate-100 backdrop-blur-md transition hover:border-emerald-400/35 hover:bg-emerald-500/[0.08] hover:text-white sm:w-auto"
                >
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/25 transition group-hover:bg-emerald-500/25">
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                  </span>
                  <span className="flex min-w-0 flex-col items-start leading-none">
                    <span className="text-[13px] font-semibold tracking-wide">
                      {t("hero.whatsappCta")}
                    </span>
                    <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 group-hover:text-emerald-300/80">
                      {t("hero.whatsappSub")}
                    </span>
                  </span>
                </a>
              </div>

            </div>

            <div className="relative mx-auto w-full max-w-3xl animate-fade-up-delay">
              <div
                className="absolute -inset-5 rounded-[2.5rem] border border-gold/10"
                aria-hidden="true"
              />
              <div
                className="absolute -right-3 -top-3 h-24 w-24 border-r border-t border-gold/50"
                aria-hidden="true"
              />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900 shadow-[0_35px_100px_rgba(0,0,0,0.6)] sm:aspect-[16/10]">
                <Image
                  src={heroImage}
                  alt={
                    heroVehicle
                      ? `${heroVehicle.brand} ${heroVehicle.model}`
                      : "ASK RENT A CAR"
                  }
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition duration-1000 hover:scale-[1.025]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-slate-950/20" />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-7">
                  <span className="rounded-full border border-white/15 bg-slate-950/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-xl">
                    {t("home.featured")}
                  </span>
                  <span className="text-xs font-medium text-white/70">
                    01 — ASK
                  </span>
                </div>
                {heroVehicle && (
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gold">
                        {heroVehicle.specs.year} ·{" "}
                        {t(`transmission.${heroVehicle.specs.transmission}`)}
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
                        {heroVehicle.brand} {heroVehicle.model}
                      </h2>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-400">
                        {t("vehicle.from")}
                      </p>
                      <p className="text-lg font-semibold text-white sm:text-xl">
                        {formatFrom(
                          heroVehicle.pricing.daily,
                          heroVehicle.pricing.currency,
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-14 animate-fade-up-late md:mt-16">
            <ReservationSearch compact />
          </div>
        </div>
      </section>

      <section className="container-premium py-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold md:text-3xl">
            {t("home.featured")}
          </h2>
          <Link href="/vehicles" className="text-sm text-gold">
            {t("common.viewAll")}
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          {(featured?.data ?? []).map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </section>

      <section className="container-premium py-16">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            {t("home.region")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
            {t("home.campaigns")}
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {activeCampaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="group overflow-hidden rounded-[2rem] border-white/10 p-0"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={campaign.image}
                  alt={localize(campaign.title, locale)}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xl">
                  %{campaign.discountPercent} {t("campaign.discount")}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold">
                  {localize(campaign.title, locale)}
                </h3>
                <p className="mt-2 min-h-10 text-sm leading-5 text-slate-400">
                  {localize(campaign.description, locale)}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.04] px-3 py-2.5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                      {t("campaign.code")}
                    </p>
                    <p className="font-mono text-sm font-semibold text-gold">
                      {campaign.code}
                    </p>
                  </div>
                  <Copy className="h-4 w-4 text-slate-500" aria-hidden="true" />
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  {t("campaign.validUntil")}{" "}
                  {new Date(campaign.endsAt).toLocaleDateString(locale)}
                </div>
                <Link
                  href={`/booking?campaign=${encodeURIComponent(campaign.code)}`}
                  className="mt-5 block"
                >
                  <Button className="w-full">
                    {t("home.startBooking")}
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
