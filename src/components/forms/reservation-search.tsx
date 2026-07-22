"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpRight,
  CalendarDays,
  CarFront,
  Clock3,
  MapPin,
  Search,
} from "lucide-react";
import { searchSchema, type SearchInput } from "@/lib/validations";
import { useCategories, useLocations } from "@/hooks/use-data";
import { useLocale } from "@/providers/locale-provider";
import { localize } from "@/services";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/primitives";

export function ReservationSearch({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { data: locations } = useLocations();
  const { data: categories } = useCategories();
  const form = useForm<SearchInput>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      pickupLocationId: "",
      dropoffLocationId: "",
      pickupAt: "",
      returnAt: "",
      pickupTime: "10:00",
      returnTime: "10:00",
      categorySlug: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const params = new URLSearchParams({
      pickup: values.pickupLocationId,
      dropoff: values.dropoffLocationId,
      from: `${values.pickupAt}T${values.pickupTime}`,
      to: `${values.returnAt}T${values.returnTime}`,
    });
    if (values.categorySlug) params.set("category", values.categorySlug);
    router.push(`/vehicles?${params.toString()}`);
  });

  return (
    <form
      onSubmit={onSubmit}
      className={`relative overflow-hidden rounded-[2rem] border border-white/[0.14] bg-slate-950/80 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:p-6 ${
        compact ? "" : "md:-mt-8"
      }`}
    >
      <span className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white md:text-2xl">
              {t("search.title")}
            </h2>
          </div>
          <p className="max-w-md text-xs leading-5 text-slate-500 sm:text-right">
            {t("search.subtitle")}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="group rounded-2xl border border-white/[0.09] bg-white/[0.035] p-3 transition hover:border-blue-400/30 hover:bg-white/[0.055]">
            <Label
              htmlFor="pickupLocationId"
              className="flex items-center gap-2 text-xs text-slate-400"
            >
              <MapPin className="h-4 w-4 text-blue-300" />
              {t("search.pickup")}
            </Label>
            <Select
              id="pickupLocationId"
              className="h-9 border-0 bg-transparent px-0 font-medium shadow-none [color-scheme:dark]"
              {...form.register("pickupLocationId")}
            >
              <option value="">{t("search.select")}</option>
              {(locations ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {localize(l.name, locale)}
                </option>
              ))}
            </Select>
          </div>
          <div className="group rounded-2xl border border-white/[0.09] bg-white/[0.035] p-3 transition hover:border-blue-400/30 hover:bg-white/[0.055]">
            <Label
              htmlFor="dropoffLocationId"
              className="flex items-center gap-2 text-xs text-slate-400"
            >
              <MapPin className="h-4 w-4 text-gold" />
              {t("search.dropoff")}
            </Label>
            <Select
              id="dropoffLocationId"
              className="h-9 border-0 bg-transparent px-0 font-medium shadow-none [color-scheme:dark]"
              {...form.register("dropoffLocationId")}
            >
              <option value="">{t("search.select")}</option>
              {(locations ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {localize(l.name, locale)}
                </option>
              ))}
            </Select>
          </div>
          <div className="group rounded-2xl border border-white/[0.09] bg-white/[0.035] p-3 transition hover:border-blue-400/30 hover:bg-white/[0.055]">
            <Label
              htmlFor="pickupAt"
              className="flex items-center gap-2 text-xs text-slate-400"
            >
              <CalendarDays className="h-4 w-4 text-blue-300" />
              {t("search.pickupDate")}
            </Label>
            <Input
              id="pickupAt"
              type="date"
              className="h-9 border-0 bg-transparent px-0 font-medium shadow-none [color-scheme:dark]"
              {...form.register("pickupAt")}
            />
          </div>
          <div className="group rounded-2xl border border-white/[0.09] bg-white/[0.035] p-3 transition hover:border-blue-400/30 hover:bg-white/[0.055]">
            <Label
              htmlFor="returnAt"
              className="flex items-center gap-2 text-xs text-slate-400"
            >
              <CalendarDays className="h-4 w-4 text-gold" />
              {t("search.returnDate")}
            </Label>
            <Input
              id="returnAt"
              type="date"
              className="h-9 border-0 bg-transparent px-0 font-medium shadow-none [color-scheme:dark]"
              {...form.register("returnAt")}
            />
          </div>
          <div className="group rounded-2xl border border-white/[0.09] bg-white/[0.035] p-3 transition hover:border-blue-400/30 hover:bg-white/[0.055]">
            <Label
              htmlFor="pickupTime"
              className="flex items-center gap-2 text-xs text-slate-400"
            >
              <Clock3 className="h-4 w-4 text-blue-300" />
              {t("search.pickupTime")}
            </Label>
            <Input
              id="pickupTime"
              type="time"
              className="h-9 border-0 bg-transparent px-0 font-medium shadow-none [color-scheme:dark]"
              {...form.register("pickupTime")}
            />
          </div>
          <div className="group rounded-2xl border border-white/[0.09] bg-white/[0.035] p-3 transition hover:border-blue-400/30 hover:bg-white/[0.055]">
            <Label
              htmlFor="returnTime"
              className="flex items-center gap-2 text-xs text-slate-400"
            >
              <Clock3 className="h-4 w-4 text-gold" />
              {t("search.returnTime")}
            </Label>
            <Input
              id="returnTime"
              type="time"
              className="h-9 border-0 bg-transparent px-0 font-medium shadow-none [color-scheme:dark]"
              {...form.register("returnTime")}
            />
          </div>
          <div className="group rounded-2xl border border-white/[0.09] bg-white/[0.035] p-3 transition hover:border-blue-400/30 hover:bg-white/[0.055]">
            <Label
              htmlFor="categorySlug"
              className="flex items-center gap-2 text-xs text-slate-400"
            >
              <CarFront className="h-4 w-4 text-gold" />
              {t("search.type")}
            </Label>
            <Select
              id="categorySlug"
              className="h-9 border-0 bg-transparent px-0 font-medium shadow-none [color-scheme:dark]"
              {...form.register("categorySlug")}
            >
              <option value="">{t("search.all")}</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.slug}>
                  {localize(c.name, locale)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-stretch">
            <Button
              type="submit"
              variant="gold"
              className="group relative min-h-[76px] w-full overflow-hidden rounded-2xl border border-white/25 bg-[linear-gradient(110deg,#e7d09a_0%,#c8a96a_42%,#f0d79c_70%,#ae8648_100%)] px-5 text-slate-950 shadow-[0_18px_45px_rgba(200,169,106,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_22px_55px_rgba(200,169,106,0.34)]"
              size="lg"
            >
              <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/80" />
              <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 group-hover:translate-x-[450%]" />
              <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-gold shadow-lg">
                <Search className="h-4.5 w-4.5" />
              </span>
              <span className="relative flex-1 text-center text-base font-semibold tracking-wide">
                {t("search.submit")}
              </span>
              <ArrowUpRight className="relative h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
        {Object.keys(form.formState.errors).length > 0 && (
          <p
            className="mt-4 rounded-xl border border-rose-400/15 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
            role="alert"
          >
            {t("search.required")}
          </p>
        )}
      </div>
    </form>
  );
}
