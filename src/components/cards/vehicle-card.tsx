"use client";

import Image from "next/image";
import Link from "next/link";
import { Fuel, Gauge, Heart, Layers3, Scale, Star, Users } from "lucide-react";
import type { Vehicle } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { useCurrency } from "@/providers/currency-provider";
import { useLocale } from "@/providers/locale-provider";
import { useAuth } from "@/providers/auth-provider";
import { useCompare } from "@/providers/compare-provider";
import { useMouseTilt } from "@/hooks/use-motion";
import { cn } from "@/utils/cn";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { formatFrom } = useCurrency();
  const { t } = useLocale();
  const { user, toggleFavorite } = useAuth();
  const { toggle, has } = useCompare();
  const { ref } = useMouseTilt(8);
  const discounted =
    vehicle.pricing.discountPercent > 0
      ? vehicle.pricing.daily * (1 - vehicle.pricing.discountPercent / 100)
      : vehicle.pricing.daily;
  const fav = user?.favoriteVehicleIds.includes(vehicle.id);

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition duration-300 will-change-transform hover:border-accent/40 hover:shadow-[0_0_40px_rgba(37,99,235,.25)]"
    >
      <Link
        href={`/vehicles/${vehicle.slug}`}
        aria-label={`${vehicle.brand} ${vehicle.model} — ${t("vehicle.viewDetails")}`}
        className="absolute inset-0 z-10 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
      />
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={vehicle.images[0]?.url || "/next.svg"}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-2">
          {vehicle.featured && (
            <Badge className="border-gold/70 bg-gold px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-md shadow-gold/30">
              <Star className="mr-0.5 h-2.5 w-2.5 fill-current" aria-hidden />
              {t("vehicle.featured")}
            </Badge>
          )}
          {vehicle.pricing.discountPercent > 0 && (
            <Badge className="border-accent/50 bg-accent px-2 py-0.5 text-[10px] font-semibold text-white shadow-md shadow-blue-600/25">
              -{vehicle.pricing.discountPercent}%
            </Badge>
          )}
        </div>
        <div className="absolute right-3 top-3 z-20 flex gap-2">
          <button
            aria-label={t("vehicle.favorite")}
            onClick={() => toggleFavorite(vehicle.id)}
            className={cn(
              "rounded-full bg-black/40 p-2 backdrop-blur hover:bg-black/60",
              fav && "text-rose-400",
            )}
          >
            <Heart className={cn("h-4 w-4", fav && "fill-current")} />
          </button>
          <button
            aria-label={t("vehicle.compare")}
            onClick={() => toggle(vehicle.id)}
            className={cn(
              "rounded-full bg-black/40 p-2 backdrop-blur hover:bg-black/60",
              has(vehicle.id) && "text-gold",
            )}
          >
            <Scale className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-sm text-slate-400">{vehicle.specs.year}</p>
          </div>
          <div className="flex items-center gap-1 text-sm text-gold">
            <Star className="h-4 w-4 fill-current" />
            {vehicle.rating}
            <span className="text-slate-500">({vehicle.reviewCount})</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 sm:grid-cols-4">
          <span className="inline-flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5 text-accent" />{" "}
            {t(`fuel.${vehicle.specs.fuel}`)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5 text-accent" />{" "}
            {t(`transmission.${vehicle.specs.transmission}`)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-accent" /> {vehicle.specs.seats}
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers3 className="h-3.5 w-3.5 text-accent" /> {vehicle.specs.bags}{" "}
            {t("vehicle.bags")}
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            {vehicle.pricing.discountPercent > 0 && (
              <div className="text-xs text-slate-500 line-through">
                {formatFrom(vehicle.pricing.daily, vehicle.pricing.currency)}
              </div>
            )}
            <div className="text-xl font-semibold">
              {formatFrom(discounted, vehicle.pricing.currency)}
              <span className="text-sm font-normal text-slate-400">
                {" "}
                / {t("vehicle.day")}
              </span>
            </div>
          </div>
          <Link
            href={`/booking?vehicle=${vehicle.slug}`}
            className="relative z-20"
          >
            <Button size="sm">{t("vehicle.rent")}</Button>
          </Link>
        </div>

        <span className="block text-sm text-slate-400 transition group-hover:text-white">
          {t("vehicle.viewDetails")} →
        </span>
      </div>
    </div>
  );
}
