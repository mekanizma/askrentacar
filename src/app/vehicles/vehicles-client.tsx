"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { VehicleCard } from "@/components/cards/vehicle-card";
import { ReservationSearch } from "@/components/forms/reservation-search";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Skeleton } from "@/components/ui/primitives";
import { useCategories, useVehicles } from "@/hooks/use-data";
import { useLocale } from "@/providers/locale-provider";
import { useCurrency } from "@/providers/currency-provider";
import { localize } from "@/services";
import type { FuelType, Transmission, VehicleFilters } from "@/types";

export default function VehiclesPage() {
  const params = useSearchParams();
  const { locale, t } = useLocale();
  const { currencySymbol, convertFromEur } = useCurrency();
  const eurRate = convertFromEur(1) || 1;
  const toEur = (value: string) =>
    value ? Number(value) / eurRate : undefined;
  const { data: categories } = useCategories();
  const [mobileFilters, setMobileFilters] = useState(false);
  const [filters, setFilters] = useState<VehicleFilters>({
    categorySlug: params.get("category") || undefined,
    pickupLocationId: params.get("pickup") || undefined,
    dropoffLocationId: params.get("dropoff") || undefined,
    pickupAt: params.get("from") || undefined,
    returnAt: params.get("to") || undefined,
    sort: "popular",
    page: 1,
    pageSize: 12,
  });

  const queryFilters = useMemo(() => filters, [filters]);
  const { data, isLoading } = useVehicles(queryFilters);

  return (
    <div className="container-premium pb-20 pt-28">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold md:text-4xl">
          {t("fleet.title")}
        </h1>
        <p className="mt-2 text-slate-400">{t("fleet.description")}</p>
      </div>

      <ReservationSearch compact />

      <div className="mt-8 flex items-center justify-between gap-3 lg:hidden">
        <Button variant="secondary" onClick={() => setMobileFilters((v) => !v)}>
          {t("fleet.filters")}
        </Button>
        <Select
          value={filters.sort}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              sort: e.target.value as VehicleFilters["sort"],
              page: 1,
            }))
          }
        >
          <option value="popular">{t("filter.popular")}</option>
          <option value="price_asc">{t("filter.priceAsc")}</option>
          <option value="price_desc">{t("filter.priceDesc")}</option>
          <option value="rating">{t("filter.rating")}</option>
          <option value="newest">{t("filter.newest")}</option>
        </Select>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside
          className={`glass h-fit space-y-4 rounded-3xl p-4 ${mobileFilters ? "block" : "hidden"} lg:block`}
        >
          <div>
            <Label>{t("common.search")}</Label>
            <Input
              placeholder={t("filter.brandModelPlate")}
              onChange={(e) =>
                setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))
              }
            />
          </div>
          <div>
            <Label>{t("filter.category")}</Label>
            <Select
              value={filters.categorySlug || ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  categorySlug: e.target.value || undefined,
                  page: 1,
                }))
              }
            >
              <option value="">{t("search.all")}</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.slug}>
                  {localize(c.name, locale)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>{t("filter.fuel")}</Label>
            <Select
              value={filters.fuel || ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  fuel: (e.target.value || undefined) as FuelType | undefined,
                  page: 1,
                }))
              }
            >
              <option value="">{t("search.all")}</option>
              <option value="petrol">{t("fuel.petrol")}</option>
              <option value="diesel">{t("fuel.diesel")}</option>
              <option value="hybrid">{t("fuel.hybrid")}</option>
              <option value="electric">{t("fuel.electric")}</option>
            </Select>
          </div>
          <div>
            <Label>{t("filter.transmission")}</Label>
            <Select
              value={filters.transmission || ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  transmission: (e.target.value || undefined) as
                    Transmission | undefined,
                  page: 1,
                }))
              }
            >
              <option value="">{t("search.all")}</option>
              <option value="automatic">{t("transmission.automatic")}</option>
              <option value="manual">{t("transmission.manual")}</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>{`${t("filter.minimum")} (${currencySymbol})`}</Label>
              <Input
                type="number"
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    priceMin: toEur(e.target.value),
                    page: 1,
                  }))
                }
              />
            </div>
            <div>
              <Label>{`${t("filter.maximum")} (${currencySymbol})`}</Label>
              <Input
                type="number"
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    priceMax: toEur(e.target.value),
                    page: 1,
                  }))
                }
              />
            </div>
          </div>
          <div className="hidden lg:block">
            <Label>{t("filter.sort")}</Label>
            <Select
              value={filters.sort}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  sort: e.target.value as VehicleFilters["sort"],
                  page: 1,
                }))
              }
            >
              <option value="popular">{t("filter.popular")}</option>
              <option value="price_asc">{t("filter.priceAsc")}</option>
              <option value="price_desc">{t("filter.priceDesc")}</option>
              <option value="rating">{t("filter.rating")}</option>
              <option value="newest">{t("filter.newest")}</option>
            </Select>
          </div>
        </aside>

        <div>
          <div className="mb-4 text-sm text-slate-400">
            {data?.total ?? 0} {t("fleet.found")}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            {(data?.data ?? []).map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              disabled={(data?.page ?? 1) <= 1}
              onClick={() =>
                setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))
              }
            >
              {t("fleet.previous")}
            </Button>
            <span className="text-sm text-slate-400">
              {t("fleet.page")} {data?.page ?? 1} / {data?.totalPages ?? 1}
            </span>
            <Button
              variant="secondary"
              disabled={(data?.page ?? 1) >= (data?.totalPages ?? 1)}
              onClick={() =>
                setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))
              }
            >
              {t("fleet.next")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
