"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  ShieldCheck,
  Snowflake,
  Star,
  Users,
  X,
  Expand,
} from "lucide-react";
import { VehicleCard } from "@/components/cards/vehicle-card";
import {
  BookingDateCalendar,
  dateToLocalInput,
} from "@/components/booking/booking-date-calendar";
import { Button } from "@/components/ui/button";
import { Badge, Card, Skeleton } from "@/components/ui/primitives";
import { useVehicle, useVehicleBusyPeriods } from "@/hooks/use-data";
import { localize, vehicleService } from "@/services";
import { useCurrency } from "@/providers/currency-provider";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/utils/cn";

export function VehicleDetail({ slug }: { slug: string }) {
  const { data: vehicle, isLoading } = useVehicle(slug);
  const { data: busyPeriods } = useVehicleBusyPeriods(vehicle?.id);
  const { data: similar } = useQuery({
    queryKey: ["similar", vehicle?.id],
    queryFn: () => vehicleService.similar(vehicle!.id),
    enabled: !!vehicle?.id,
  });
  const { formatFrom } = useCurrency();
  const { locale, t } = useLocale();
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  const onSelect = useCallback(() => {
    if (embla) setSelectedImage(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on("select", onSelect);
    embla.on("reInit", onSelect);
    return () => {
      embla.off("select", onSelect);
      embla.off("reInit", onSelect);
    };
  }, [embla, onSelect]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") {
        embla?.scrollPrev();
      }
      if (event.key === "ArrowRight") {
        embla?.scrollNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, embla]);

  const bookingHref = useMemo(() => {
    if (!vehicle) return "/booking";
    const query = new URLSearchParams({ vehicle: vehicle.slug });
    if (rangeStart) query.set("from", dateToLocalInput(rangeStart, "10:00"));
    if (rangeEnd) query.set("to", dateToLocalInput(rangeEnd, "10:00"));
    return `/booking?${query.toString()}`;
  }, [vehicle, rangeStart, rangeEnd]);

  if (isLoading) {
    return (
      <div className="container-premium space-y-5 pb-20 pt-28">
        <Skeleton className="h-7 w-40" />
        <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
          <Skeleton className="aspect-[16/10] w-full" />
          <Skeleton className="h-[520px]" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container-premium pb-20 pt-28">
        <Card>{t("vehicle.notFound")}</Card>
      </div>
    );
  }

  const discountedPrice =
    vehicle.pricing.discountPercent > 0
      ? vehicle.pricing.daily * (1 - vehicle.pricing.discountPercent / 100)
      : vehicle.pricing.daily;

  const quickSpecs = [
    {
      icon: Gauge,
      label: t("spec.transmission"),
      value: t(`transmission.${vehicle.specs.transmission}`),
    },
    {
      icon: Fuel,
      label: t("spec.fuel"),
      value: t(`fuel.${vehicle.specs.fuel}`),
    },
    { icon: Users, label: t("spec.seats"), value: String(vehicle.specs.seats) },
    {
      icon: BriefcaseBusiness,
      label: t("spec.bags"),
      value: String(vehicle.specs.bags),
    },
    {
      icon: Snowflake,
      label: t("spec.ac"),
      value: t(vehicle.specs.ac ? "common.yes" : "common.no"),
    },
  ];

  const included =
    vehicle.included?.length > 0
      ? vehicle.included
      : [
          t("vehicle.freeCancellation"),
          t("vehicle.support247"),
          t("vehicle.airportDelivery"),
          t("vehicle.inspected"),
        ];

  return (
    <>
    <div className="pb-20 pt-24 md:pt-28">
      <div className="container-premium">
        <Link
          href="/vehicles"
          className="mb-5 inline-flex items-center gap-2 rounded-full text-sm text-slate-400 transition hover:text-white focus-ring"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("vehicle.backToFleet")}
        </Link>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px] xl:gap-8">
          <div className="min-w-0 space-y-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl">
              <div ref={emblaRef} className="overflow-hidden">
                <div className="flex">
                  {vehicle.images.map((image) => (
                    <button
                      type="button"
                      key={image.id}
                      className="relative aspect-[16/10] min-w-0 flex-[0_0_100%] cursor-zoom-in overflow-hidden"
                      onClick={() => setLightboxOpen(true)}
                      aria-label={t("vehicle.clickZoom")}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        priority={image.order === 0}
                        className="object-cover transition duration-500 hover:scale-[1.02]"
                        sizes="(max-width: 1024px) 100vw, 70vw"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-black/10" />
                      <span className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-xl">
                        <Expand className="h-3.5 w-3.5" aria-hidden />
                        {t("vehicle.fullscreen")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-center justify-between">
                <Badge className="border-white/15 bg-black/35 px-3 py-1.5 backdrop-blur-xl">
                  {t("vehicle.gallery")} · {selectedImage + 1}/
                  {vehicle.images.length}
                </Badge>
                <Badge className="border-emerald-400/20 bg-emerald-500/15 text-emerald-200 backdrop-blur-xl">
                  {vehicle.status === "available"
                    ? t("vehicle.available")
                    : t("vehicle.unavailable")}
                </Badge>
              </div>

              <button
                type="button"
                onClick={() => embla?.scrollPrev()}
                className="absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 backdrop-blur-xl transition hover:bg-black/70 focus-ring"
                aria-label={t("vehicle.previous")}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => embla?.scrollNext()}
                className="absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 backdrop-blur-xl transition hover:bg-black/70 focus-ring"
                aria-label={t("vehicle.next")}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {vehicle.images.slice(0, 8).map((image, index) => (
                <button
                  type="button"
                  key={image.id}
                  onClick={() => embla?.scrollTo(index)}
                  aria-label={`${t("vehicle.gallery")} ${index + 1}`}
                  className={cn(
                    "relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition md:h-20 md:w-28",
                    selectedImage === index
                      ? "border-gold ring-2 ring-gold/20"
                      : "border-white/10 opacity-60 hover:opacity-100",
                  )}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </button>
              ))}
            </div>
          </div>

          <aside className="glass rounded-[2rem] p-5 shadow-2xl lg:sticky lg:top-24 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{vehicle.specs.year}</Badge>
              {vehicle.featured && (
                <Badge className="border-gold/70 bg-gold px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-950">
                  {t("vehicle.featured")}
                </Badge>
              )}
              {vehicle.pricing.discountPercent > 0 && (
                <Badge className="border-blue-400/20 bg-blue-500/15 text-blue-200">
                  -{vehicle.pricing.discountPercent}%
                </Badge>
              )}
            </div>

            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight md:text-4xl">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {localize(vehicle.description, locale)}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex text-gold" aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "h-4 w-4",
                      index < Math.round(vehicle.rating) && "fill-current",
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{vehicle.rating}</span>
              <span className="text-sm text-slate-500">
                ({vehicle.reviewCount} {t("vehicle.reviews")})
              </span>
            </div>

            <div className="my-6 border-y border-white/10 py-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {t("vehicle.dailyPrice")}
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-white">
                      {formatFrom(discountedPrice, vehicle.pricing.currency)}
                    </span>
                    <span className="text-sm text-slate-400">
                      / {t("vehicle.day")}
                    </span>
                  </div>
                  {vehicle.pricing.discountPercent > 0 && (
                    <span className="text-sm text-slate-500 line-through">
                      {formatFrom(
                        vehicle.pricing.daily,
                        vehicle.pricing.currency,
                      )}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    {t("vehicle.deposit")}
                  </p>
                  <p className="font-medium">
                    {formatFrom(
                      vehicle.pricing.deposit,
                      vehicle.pricing.currency,
                    )}
                  </p>
                </div>
              </div>
            </div>

            <Link href={bookingHref} className="block">
              <Button size="lg" className="w-full">
                <CalendarDays className="h-4 w-4" />
                {rangeStart && rangeEnd
                  ? t("vehicle.continueBooking")
                  : t("vehicle.bookNow")}
              </Button>
            </Link>
            <p className="mt-3 text-center text-xs leading-5 text-slate-500">
              {t("vehicle.priceNote")}
            </p>
          </aside>
        </div>

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">
              {t("vehicle.highlights")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
              {t("vehicle.specifications")}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {quickSpecs.map(({ icon: Icon, label, value }) => (
              <Card key={label} className="rounded-2xl p-4">
                <Icon className="h-5 w-5 text-gold" />
                <p className="mt-4 text-xs text-slate-500">{label}</p>
                <p className="mt-1 font-medium capitalize">{value}</p>
              </Card>
            ))}
          </div>
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card className="rounded-[2rem] p-5 md:p-7">
            <h2 className="text-xl font-semibold">{t("vehicle.included")}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {included.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-white/[0.04] p-3"
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm leading-6 text-slate-300">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[2rem] p-5 md:p-7">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold">
                  {t("vehicle.calendar")}
                </h2>
              </div>
              <ShieldCheck className="h-7 w-7 shrink-0 text-gold" />
            </div>

            <BookingDateCalendar
              className="mt-2"
              blockedPeriods={vehicle.blockedPeriods}
              busyPeriods={busyPeriods}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onChange={(start, end) => {
                setRangeStart(start);
                setRangeEnd(end);
              }}
              showClear={!(rangeStart && rangeEnd)}
            />

            {rangeStart && rangeEnd && (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setRangeStart(null);
                    setRangeEnd(null);
                  }}
                >
                  {t("vehicle.clearDates")}
                </Button>
                <Link href={bookingHref} className="flex-1">
                  <Button className="w-full">
                    {t("vehicle.continueBooking")}
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {(similar ?? []).length > 0 && (
          <section className="mt-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold md:text-3xl">
                {t("vehicle.similar")}
              </h2>
              <Link
                href="/vehicles"
                className="text-sm text-gold hover:text-white"
              >
                {t("common.viewAll")} →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {(similar ?? []).map((item) => (
                <VehicleCard key={item.id} vehicle={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>

    {lightboxOpen && (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={t("vehicle.fullscreen")}
        onClick={() => setLightboxOpen(false)}
      >
        <button
          type="button"
          onClick={() => setLightboxOpen(false)}
          className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20 focus-ring sm:right-5 sm:top-5"
          aria-label={t("vehicle.closeFullscreen")}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur-xl sm:left-5 sm:top-5">
          {selectedImage + 1} / {vehicle.images.length}
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            embla?.scrollPrev();
          }}
          className="absolute left-2 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20 focus-ring sm:left-5"
          aria-label={t("vehicle.previous")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            embla?.scrollNext();
          }}
          className="absolute right-2 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20 focus-ring sm:right-5"
          aria-label={t("vehicle.next")}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          className="relative h-[min(78svh,820px)] w-full max-w-6xl"
          onClick={(event) => event.stopPropagation()}
        >
          <Image
            src={vehicle.images[selectedImage]?.url || vehicle.images[0]!.url}
            alt={
              vehicle.images[selectedImage]?.alt ||
              `${vehicle.brand} ${vehicle.model}`
            }
            fill
            priority
            className="object-contain"
            sizes="100vw"
          />
        </div>
      </div>
    )}
    </>
  );
}
