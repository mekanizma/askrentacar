"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import {
  useAddOns,
  useBookings,
  useCampaigns,
  useDashboardStats,
  useLocations,
  useUsers,
  useVehicles,
} from "@/hooks/use-data";
import {
  bookingService,
  contentService,
  userService,
  vehicleService,
} from "@/services";
import type {
  Booking,
  BookingStatus,
  Campaign,
  SiteSettings,
  Vehicle,
  VehicleStatus,
} from "@/types";
import { BRAND } from "@/constants";
import { Button } from "@/components/ui/button";
import {
  Badge,
  Card,
  Input,
  Label,
  Select,
  Skeleton,
  Textarea,
} from "@/components/ui/primitives";

function Header({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[.22em] text-gold">Yönetim</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">{text}</p>
      </div>
      {action}
    </header>
  );
}
const statusColor = (status: string) =>
  status === "available" || status === "confirmed" || status === "completed"
    ? "text-emerald-300"
    : status === "cancelled" || status === "inactive"
      ? "text-red-300"
      : "text-amber-300";
const statusLabel = (status: string) =>
  ({
    available: "Müsait",
    rented: "Kirada",
    maintenance: "Bakımda",
    inactive: "Pasif",
    pending: "Bekliyor",
    confirmed: "Onaylandı",
    delivered: "Teslim Edildi",
    cancelled: "İptal Edildi",
    completed: "Tamamlandı",
    paid: "Ödendi",
    due: "Ödeme Bekliyor",
    void: "Geçersiz",
    customer: "Müşteri",
    admin: "Yönetici",
  })[status] ?? status;

export function DashboardAdmin() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: bookings } = useBookings({ pageSize: 12 });
  const cards = stats
    ? [
        ["Toplam Araç", stats.totalVehicles],
        ["Müsait Araç", stats.availableVehicles],
        ["Rezervasyon", stats.totalBookings],
        ["Gelir", `€${stats.revenue.toLocaleString("tr-TR")}`],
        ["Bugün Teslim", stats.todayPickups],
        ["Bugün İade", stats.todayReturns],
        ["Müşteriler", stats.customers],
        ["Doluluk", `%${stats.occupancyRate}`],
      ]
    : [];
  const chart = useMemo(() => {
    const map = new Map<string, number>();
    bookings?.data.forEach((b) => {
      const day = new Date(b.createdAt).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
      });
      map.set(day, (map.get(day) ?? 0) + b.total);
    });
    return [...map].map(([name, revenue]) => ({ name, revenue })).reverse();
  }, [bookings]);
  return (
    <>
      <Header
        title="Genel Bakış"
        text="Filo ve rezervasyon performansının anlık özeti."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isLoading
          ? [1, 2, 3, 4, 5, 6, 7, 8].map((x) => (
              <Skeleton key={x} className="h-28" />
            ))
          : cards.map(([label, value]) => (
              <Card key={label} className="rounded-2xl p-4">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {value}
                </p>
              </Card>
            ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <Card>
          <h2 className="mb-5 font-semibold">Son rezervasyon geliri</h2>
          <div className="h-72" aria-label="Rezervasyon gelir grafiği">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid stroke="#ffffff12" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #ffffff18",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="revenue" fill="#C8A96A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Son rezervasyonlar</h2>
          <div className="space-y-3">
            {bookings?.data.slice(0, 7).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl bg-white/5 p-3"
              >
                <div>
                  <p className="text-sm">{b.code}</p>
                  <p className="text-xs text-slate-500">
                    {b.customer.firstName} {b.customer.lastName}
                  </p>
                </div>
                <Badge className={statusColor(b.status)}>
                  {statusLabel(b.status)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

export function VehiclesAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [creating, setCreating] = useState(false);
  const { data, isLoading } = useVehicles({
    q,
    status: (status as VehicleStatus) || undefined,
    pageSize: 100,
  });
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    try {
      if (editing)
        await vehicleService.update(editing.id, {
          brand: String(fd.get("brand")),
          model: String(fd.get("model")),
          pricing: { ...editing.pricing, daily: Number(fd.get("daily")) },
          status: String(fd.get("status")) as VehicleStatus,
        });
      else {
        const now = Date.now();
        const brand = String(fd.get("brand"));
        const model = String(fd.get("model"));
        const template = data?.data[0];
        const daily = Number(fd.get("daily"));
        const defaults = {
          categoryId: template?.categoryId ?? "",
          featured: false,
          rating: 5,
          reviewCount: 0,
          mileage: 0,
          specs: template?.specs ?? {
            year: new Date().getFullYear(),
            fuel: "petrol" as const,
            transmission: "automatic" as const,
            seats: 5,
            bags: 2,
            doors: 4,
            ac: true,
            engine: "1.6",
            horsepower: 120,
            consumption: "6.5L",
            drivetrain: "FWD",
          },
          pricing: {
            daily,
            weekly: Math.round(daily * 6),
            monthly: Math.round(daily * 20),
            currency: "EUR" as const,
            discountPercent: 0,
            deposit: 200,
            insuranceDaily: 10,
          },
          features: template?.features ?? [],
          images: template?.images ?? [],
          description: template?.description ?? {
            tr: `${brand} ${model}`,
            en: `${brand} ${model}`,
            ru: `${brand} ${model}`,
          },
          insuranceExpiry:
            template?.insuranceExpiry ??
            new Date(now + 365 * 86400000).toISOString(),
          maintenanceDue:
            template?.maintenanceDue ??
            new Date(now + 180 * 86400000).toISOString(),
          inspectionDue:
            template?.inspectionDue ??
            new Date(now + 365 * 86400000).toISOString(),
        };
        await vehicleService.create({
          ...defaults,
          slug: `${brand}-${model}-${now}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-"),
          plate: `NEW ${String(now).slice(-4)}`,
          chassis: `NEW${now}`,
          brand,
          model,
          status: String(fd.get("status")) as VehicleStatus,
        });
      }
      toast.success("Araç kaydedildi");
      setEditing(null);
      setCreating(false);
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kaydedilemedi");
    }
  };
  return (
    <>
      <Header
        title="Araçlar"
        text="Filoyu arayın, filtreleyin ve yönetin."
        action={
          <Button
            onClick={() => {
              setCreating(true);
              setEditing(null);
            }}
          >
            <Plus size={16} /> Yeni araç
          </Button>
        }
      />
      {(editing || creating) && (
        <Card className="mb-6">
          <form
            onSubmit={save}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div>
              <Label>Marka</Label>
              <Input name="brand" defaultValue={editing?.brand} required />
            </div>
            <div>
              <Label>Model</Label>
              <Input name="model" defaultValue={editing?.model} required />
            </div>
            <div>
              <Label>Günlük €</Label>
              <Input
                name="daily"
                type="number"
                min="1"
                defaultValue={editing?.pricing.daily ?? 100}
                required
              />
            </div>
            <div>
              <Label>Durum</Label>
              <Select
                name="status"
                defaultValue={editing?.status ?? "available"}
              >
                <option value="available">Müsait</option>
                <option value="rented">Kirada</option>
                <option value="maintenance">Bakımda</option>
                <option value="inactive">Pasif</option>
              </Select>
            </div>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
              <Button type="submit">Kaydet</Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setCreating(false);
                }}
              >
                Vazgeç
              </Button>
            </div>
          </form>
        </Card>
      )}
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search
            className="absolute left-3 top-3.5 text-slate-500"
            size={16}
          />
          <Input
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Marka, model veya plaka ara"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tüm durumlar</option>
          <option value="available">Müsait</option>
          <option value="rented">Kirada</option>
          <option value="maintenance">Bakımda</option>
        </Select>
      </div>
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="grid gap-3">
          {data?.data.map((v) => (
            <Card
              key={v.id}
              className="flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-full shrink-0 sm:w-36">
                <Image
                  src={v.images[0]!.url}
                  alt={`${v.brand} ${v.model}`}
                  fill
                  className="rounded-xl object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">
                  {v.brand} {v.model}
                </h2>
                <p className="text-xs text-slate-400">
                  {v.plate} · {v.specs.year}
                </p>
              </div>
              <Badge className={statusColor(v.status)}>
                {statusLabel(v.status)}
              </Badge>
              <p className="font-semibold text-gold">€{v.pricing.daily}</p>
              <Button
                size="icon"
                variant="secondary"
                aria-label="Aracı düzenle"
                onClick={() => {
                  setEditing(v);
                  setCreating(false);
                }}
              >
                <Pencil size={16} />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export function BookingsAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { data, isLoading } = useBookings({
    q,
    status: (status as BookingStatus) || undefined,
    pageSize: 100,
  });
  const { data: vehicles } = useVehicles({ pageSize: 200 });
  const { data: locations } = useLocations();
  const { data: addOns } = useAddOns();

  const vehicleMap = useMemo(() => {
    const map = new Map<string, Vehicle>();
    vehicles?.data.forEach((v) => map.set(v.id, v));
    return map;
  }, [vehicles]);

  const locationMap = useMemo(() => {
    const map = new Map<string, string>();
    locations?.forEach((l) => map.set(l.id, l.name.tr || l.name.en));
    return map;
  }, [locations]);

  const addOnMap = useMemo(() => {
    const map = new Map<string, string>();
    addOns?.forEach((a) => map.set(a.id, a.name.tr || a.name.en));
    return map;
  }, [addOns]);

  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (licensePreview) setLicensePreview(null);
        else setSelected(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected, licensePreview]);

  const update = async (id: string, value: string) => {
    setUpdatingId(id);
    try {
      const updated = await bookingService.update(id, {
        status: value as BookingStatus,
        ...(value === "confirmed"
          ? { paymentStatus: "pending" as const }
          : value === "cancelled"
            ? { paymentStatus: "refunded" as const }
            : {}),
      });
      toast.success(
        value === "confirmed"
          ? "Rezervasyon onaylandı"
          : value === "cancelled"
            ? "Rezervasyon iptal edildi"
            : "Durum güncellendi",
      );
      setSelected((current) =>
        current?.id === updated.id ? updated : current,
      );
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["bookings"] }),
        qc.invalidateQueries({ queryKey: ["vehicle-busy-periods"] }),
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ]);
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Güncellenemedi";
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const removeBooking = async (id: string, code: string) => {
    if (
      !window.confirm(
        `${code} rezervasyonu kalıcı olarak silinsin mi? Bu işlem geri alınamaz.`,
      )
    ) {
      return;
    }
    setUpdatingId(id);
    try {
      await bookingService.remove(id);
      toast.success("Rezervasyon silindi");
      setSelected((current) => (current?.id === id ? null : current));
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["bookings"] }),
        qc.invalidateQueries({ queryKey: ["vehicle-busy-periods"] }),
        qc.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ]);
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Silinemedi";
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const selectedVehicle = selected
    ? vehicleMap.get(selected.vehicleId)
    : undefined;

  const statusOptions = [
    "pending",
    "confirmed",
    "delivered",
    "cancelled",
    "completed",
  ] as const;

  const BookingActions = ({
    booking,
    layout = "list",
  }: {
    booking: Booking;
    layout?: "list" | "detail";
  }) => {
    const busy = updatingId === booking.id;
    return (
      <div
        className={
          layout === "detail"
            ? "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end"
            : "flex flex-col gap-2 sm:items-end"
        }
      >
        <Select
          aria-label={`${booking.code} durumu`}
          className={layout === "detail" ? "sm:w-48" : "sm:w-40"}
          value={booking.status}
          disabled={busy}
          onChange={(e) => update(booking.id, e.target.value)}
        >
          {statusOptions.map((x) => (
            <option key={x} value={x}>
              {statusLabel(x)}
            </option>
          ))}
        </Select>
        <div className="flex flex-wrap gap-2">
          {booking.status === "pending" && (
            <Button
              size="sm"
              disabled={busy}
              onClick={() => update(booking.id, "confirmed")}
            >
              Onayla
            </Button>
          )}
          {booking.status !== "cancelled" && (
            <Button
              size="sm"
              variant="danger"
              disabled={busy}
              onClick={() => update(booking.id, "cancelled")}
            >
              İptal et
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => removeBooking(booking.id, booking.code)}
          >
            Sil
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header
        title="Rezervasyonlar"
        text="Tüm rezervasyonları görüntüleyin; onaylayın, iptal edin veya durumunu değiştirin."
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Kod veya müşteri ara"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tüm durumlar</option>
          {["pending", "confirmed", "delivered", "cancelled", "completed"].map(
            (x) => (
              <option key={x} value={x}>
                {statusLabel(x)}
              </option>
            ),
          )}
        </Select>
      </div>
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="space-y-3">
          {(data?.data.length ?? 0) === 0 && (
            <Card className="rounded-2xl p-6 text-center text-sm text-slate-400">
              Bu filtrede rezervasyon yok.
            </Card>
          )}
          {data?.data.map((b) => (
            <Card
              key={b.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(b)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(b);
                }
              }}
              className="grid cursor-pointer gap-3 rounded-2xl p-4 transition hover:border-accent/40 hover:bg-white/[0.04] sm:grid-cols-[1.2fr_1fr_auto] sm:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{b.code}</p>
                  <Badge
                    className={
                      b.status === "pending"
                        ? "border-amber-400/30 bg-amber-400/15 text-amber-200"
                        : b.status === "confirmed"
                          ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-200"
                          : undefined
                    }
                  >
                    {statusLabel(b.status)}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">
                  {b.customer.firstName} {b.customer.lastName} ·{" "}
                  {b.customer.phone}
                </p>
                <p className="mt-1 text-xs text-slate-500">{b.customer.email}</p>
              </div>
              <div className="text-sm text-slate-300">
                <p>
                  {new Date(b.pickupAt).toLocaleString("tr-TR")} →{" "}
                  {new Date(b.returnAt).toLocaleString("tr-TR")}
                </p>
                <p className="mt-1 font-semibold text-gold">€{b.total}</p>
              </div>
              <div
                className="flex flex-col gap-2 sm:items-end"
                onClick={(e) => e.stopPropagation()}
              >
                <BookingActions booking={b} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Rezervasyon ${selected.code}`}
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[92svh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-white/10 bg-slate-950 p-4 shadow-2xl sm:rounded-3xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{selected.code}</h2>
                  <Badge
                    className={
                      selected.status === "pending"
                        ? "border-amber-400/30 bg-amber-400/15 text-amber-200"
                        : selected.status === "confirmed"
                          ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-200"
                          : undefined
                    }
                  >
                    {statusLabel(selected.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Oluşturulma:{" "}
                  {new Date(selected.createdAt).toLocaleString("tr-TR")}
                </p>
              </div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10"
                aria-label="Kapat"
                onClick={() => setSelected(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedVehicle && (
              <div className="mb-5 flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedVehicle.images[0]?.url || BRAND.logoSrc}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium">
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </p>
                  <p className="text-sm text-slate-400">
                    {selectedVehicle.specs.year} · {selectedVehicle.plate}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedVehicle.id}
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailBlock title="Müşteri">
                <p>
                  {selected.customer.firstName} {selected.customer.lastName}
                </p>
                <p className="text-slate-400">{selected.customer.email}</p>
                <p className="text-slate-400">{selected.customer.phone}</p>
              </DetailBlock>
              <DetailBlock title="Tarih & Lokasyon">
                <p>
                  Alış: {new Date(selected.pickupAt).toLocaleString("tr-TR")}
                </p>
                <p>
                  İade: {new Date(selected.returnAt).toLocaleString("tr-TR")}
                </p>
                <p className="text-slate-400">
                  {locationMap.get(selected.pickupLocationId) ||
                    selected.pickupLocationId}{" "}
                  →{" "}
                  {locationMap.get(selected.dropoffLocationId) ||
                    selected.dropoffLocationId}
                </p>
                <p className="text-slate-400">{selected.days} gün</p>
              </DetailBlock>
              <DetailBlock title="Fiyat Özeti">
                <Row label="Günlük" value={`€${selected.dailyRate}`} />
                <Row label="Ara toplam" value={`€${selected.subtotal}`} />
                <Row label="İndirim" value={`-€${selected.discount}`} />
                <Row label="Ekstralar" value={`€${selected.extrasTotal}`} />
                <Row label="Sigorta" value={`€${selected.insuranceTotal}`} />
                <Row label="Vergi" value={`€${selected.tax}`} />
                <Row label="Toplam" value={`€${selected.total}`} strong />
              </DetailBlock>
              <DetailBlock title="Ödeme & Not">
                <p>
                  Yöntem:{" "}
                  {selected.paymentMethod === "card"
                    ? "Kart"
                    : selected.paymentMethod === "transfer"
                      ? "Havale"
                      : "Nakit / Ofiste"}
                </p>
                <p>Ödeme durumu: {statusLabel(selected.paymentStatus)}</p>
                <p className="mt-2 text-slate-400">
                  {selected.notes?.trim() || "Not yok"}
                </p>
              </DetailBlock>
            </div>

            {selected.addOns.length > 0 && (
              <DetailBlock title="Ek Hizmetler" className="mt-4">
                <ul className="space-y-1">
                  {selected.addOns.map((item) => (
                    <li
                      key={item.addOnId}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span>
                        {addOnMap.get(item.addOnId) || item.addOnId} ×{" "}
                        {item.quantity}
                      </span>
                      <span className="text-slate-400">€{item.unitPrice}</span>
                    </li>
                  ))}
                </ul>
              </DetailBlock>
            )}

            <DetailBlock title="Ehliyet Belgeleri" className="mt-4">
              {selected.customer.licenseFrontUrl ||
              selected.customer.licenseBackUrl ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {selected.customer.licenseFrontUrl && (
                    <button
                      type="button"
                      className="overflow-hidden rounded-2xl border border-white/10 text-left transition hover:border-gold/40"
                      onClick={() =>
                        setLicensePreview(selected.customer.licenseFrontUrl!)
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selected.customer.licenseFrontUrl}
                        alt="Ehliyet ön yüz"
                        className="aspect-[16/10] w-full object-cover"
                      />
                      <div className="border-t border-white/10 px-3 py-2 text-xs text-slate-300">
                        Ön yüz
                        {selected.customer.licenseFrontName
                          ? ` · ${selected.customer.licenseFrontName}`
                          : ""}
                      </div>
                    </button>
                  )}
                  {selected.customer.licenseBackUrl && (
                    <button
                      type="button"
                      className="overflow-hidden rounded-2xl border border-white/10 text-left transition hover:border-gold/40"
                      onClick={() =>
                        setLicensePreview(selected.customer.licenseBackUrl!)
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selected.customer.licenseBackUrl}
                        alt="Ehliyet arka yüz"
                        className="aspect-[16/10] w-full object-cover"
                      />
                      <div className="border-t border-white/10 px-3 py-2 text-xs text-slate-300">
                        Arka yüz
                        {selected.customer.licenseBackName
                          ? ` · ${selected.customer.licenseBackName}`
                          : ""}
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Ehliyet yüklenmemiş.</p>
              )}
            </DetailBlock>

            <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-4">
              <BookingActions booking={selected} layout="detail" />
            </div>
          </div>
        </div>
      )}

      {licensePreview && (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLicensePreview(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10"
            aria-label="Kapat"
            onClick={() => setLicensePreview(null)}
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={licensePreview}
            alt="Ehliyet önizleme"
            className="max-h-[85svh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function DetailBlock({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${className}`}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
        {title}
      </p>
      <div className="space-y-1 text-sm text-slate-200">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-3 ${strong ? "pt-1 font-semibold text-white" : ""}`}
    >
      <span className="text-slate-400">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function UsersAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [noteId, setNoteId] = useState<string>();
  const { data, isLoading } = useUsers(q);
  const save = async (id: string, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await userService.update(id, {
      notes: String(new FormData(event.currentTarget).get("notes")),
    });
    toast.success("Not kaydedildi");
    setNoteId(undefined);
    qc.invalidateQueries({ queryKey: ["users"] });
  };
  return (
    <>
      <Header
        title="Kullanıcılar"
        text="Müşterileri arayın ve dahili notları yönetin."
      />
      <Input
        className="mb-4 max-w-md"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ad veya e-posta ara"
      />
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="grid gap-3">
          {data?.map((u) => (
            <Card key={u.id} className="rounded-2xl p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <p className="font-medium">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {u.email} · {u.phone}
                  </p>
                </div>
                <Badge>{statusLabel(u.role)}</Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setNoteId(noteId === u.id ? undefined : u.id)}
                >
                  <Pencil size={14} /> Not
                </Button>
              </div>
              {noteId === u.id && (
                <form
                  onSubmit={(e) => save(u.id, e)}
                  className="mt-4 flex flex-col gap-2 sm:flex-row"
                >
                  <Textarea
                    name="notes"
                    defaultValue={u.notes}
                    placeholder="Müşteri notu"
                  />
                  <Button type="submit">Kaydet</Button>
                </form>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export function CampaignsAdmin() {
  const qc = useQueryClient();
  const { data } = useCampaigns();
  const [mode, setMode] = useState<"closed" | "create" | "edit">("closed");
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [saving, setSaving] = useState(false);
  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const code = String(fd.get("code") ?? "").trim().toUpperCase();
    const discountPercent = Number(fd.get("discount"));
    if (!title || !code || Number.isNaN(discountPercent)) {
      toast.error("Başlık, kod ve indirim zorunlu");
      return;
    }

    const now = Date.now();
    const emptyLocalized = { tr: "", en: "", ru: "" };
    const payload: Campaign = {
      id: editing?.id ?? `cmp_${now}`,
      slug: editing?.slug ?? `campaign-${now}`,
      title: {
        tr: title,
        en: editing?.title.en || title,
        ru: editing?.title.ru || title,
      },
      description: editing?.description ?? { ...emptyLocalized, tr: title },
      code,
      discountPercent,
      image: editing?.image ?? "",
      startsAt: editing?.startsAt ?? new Date().toISOString(),
      endsAt:
        editing?.endsAt ??
        new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
      active: fd.get("active") === "on",
      categoryIds: editing?.categoryIds ?? [],
    };

    setSaving(true);
    try {
      await contentService.saveCampaign(payload);
      toast.success("Kampanya kaydedildi");
      await qc.invalidateQueries({ queryKey: ["campaigns"] });
      setMode("closed");
      setEditing(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Kampanya kaydedilemedi";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };
  const remove = async (id: string) => {
    try {
      await contentService.removeCampaign(id);
      toast.success("Kampanya silindi");
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Kampanya silinemedi";
      toast.error(message);
    }
  };
  return (
    <>
      <Header
        title="Kampanyalar"
        text="İndirim kodlarını ve kampanya görünürlüğünü yönetin."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setMode("create");
            }}
          >
            <Plus size={16} /> Yeni kampanya
          </Button>
        }
      />
      {mode !== "closed" && (
        <Card className="mb-6">
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Başlık</Label>
              <Input name="title" defaultValue={editing?.title.tr} required />
            </div>
            <div>
              <Label>Kod</Label>
              <Input name="code" defaultValue={editing?.code} required />
            </div>
            <div>
              <Label>İndirim %</Label>
              <Input
                name="discount"
                type="number"
                defaultValue={editing?.discountPercent ?? 10}
                required
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                name="active"
                type="checkbox"
                defaultChecked={editing?.active ?? true}
              />{" "}
              Aktif
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={() => {
                  setMode("closed");
                  setEditing(null);
                }}
              >
                Vazgeç
              </Button>
            </div>
          </form>
        </Card>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {data?.map((c) => (
          <Card key={c.id} className="rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge
                  className={c.active ? "text-emerald-300" : "text-slate-400"}
                >
                  {c.active ? "Aktif" : "Pasif"}
                </Badge>
                <h2 className="mt-3 font-semibold">{c.title.tr}</h2>
                <p className="mt-1 text-sm text-gold">
                  {c.code} · %{c.discountPercent}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => {
                    setEditing(c);
                    setMode("edit");
                  }}
                >
                  <Pencil size={15} />
                </Button>
                <Button
                  size="icon"
                  variant="danger"
                  onClick={() => remove(c.id)}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export function MediaAdmin() {
  const [items, setItems] = useState<
    Awaited<ReturnType<typeof contentService.media>>
  >([]);
  useEffect(() => {
    contentService.media().then(setItems);
  }, []);
  return (
    <>
      <Header
        title="Medya"
        text="Filo ve içerik görsellerinin medya galerisi."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden rounded-2xl p-0">
            <div className="relative aspect-square">
              <Image
                src={item.url}
                alt={item.alt}
                fill
                className="object-cover"
              />
            </div>
            <p className="truncate p-3 text-xs text-slate-400">{item.alt}</p>
          </Card>
        ))}
      </div>
    </>
  );
}

export function SettingsAdmin() {
  const qc = useQueryClient();
  const [settings, setSettings] = useState<SiteSettings>();
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    contentService.settings().then(setSettings);
  }, []);
  if (!settings) return <Skeleton className="h-96" />;
  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const eur = Number(fd.get("rateEur"));
    const gbp = Number(fd.get("rateGbp"));
    const tryRate = Number(fd.get("rateTry"));
    if (!(eur > 0) || !(gbp > 0) || !(tryRate > 0)) {
      toast.error("EUR, GBP ve TRY kurları 0'dan büyük olmalı");
      return;
    }
    setSaving(true);
    try {
      const updated = await contentService.updateSettings({
        brandName: String(fd.get("brandName")),
        phone: String(fd.get("phone")),
        whatsapp: String(fd.get("whatsapp")),
        email: String(fd.get("email")),
        address: { ...settings.address, tr: String(fd.get("address")) },
        analytics: {
          gaId: String(fd.get("gaId")),
          gtmId: String(fd.get("gtmId")),
        },
        exchangeRates: {
          EUR: eur,
          GBP: gbp,
          TRY: tryRate,
        },
      });
      setSettings(updated);
      await qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Ayarlar kaydedildi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <Header
        title="Site Ayarları"
        text="Marka, iletişim, ölçümleme ve döviz kurlarını güncelleyin."
      />
      <Card>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Marka adı</Label>
            <Input name="brandName" defaultValue={settings.brandName} />
          </div>
          <div>
            <Label>E-posta</Label>
            <Input name="email" type="email" defaultValue={settings.email} />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input name="phone" defaultValue={settings.phone} />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input name="whatsapp" defaultValue={settings.whatsapp} />
          </div>
          <div className="sm:col-span-2">
            <Label>Adres</Label>
            <Input name="address" defaultValue={settings.address.tr} />
          </div>
          <div>
            <Label>Google Analytics ID</Label>
            <Input name="gaId" defaultValue={settings.analytics.gaId} />
          </div>
          <div>
            <Label>GTM ID</Label>
            <Input name="gtmId" defaultValue={settings.analytics.gtmId} />
          </div>

          <div
            id="rates"
            className="sm:col-span-2 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div>
              <h2 className="text-base font-semibold text-white">Döviz Kurları</h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                EUR, GBP ve TRY değerlerini ayrı ayrı girin. Araç fiyatı hangi
                para birimindeyse, seçilen birime bu oranlarla çevrilir.
                Formül: tutar ÷ kaynak kur × hedef kur.
              </p>
            </div>
            <div
              className="grid gap-4 sm:grid-cols-3"
              key={`rates-${settings.exchangeRates.EUR}-${settings.exchangeRates.GBP}-${settings.exchangeRates.TRY}`}
            >
              <div>
                <Label>EUR kur değeri</Label>
                <Input
                  name="rateEur"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  defaultValue={settings.exchangeRates.EUR}
                  required
                />
              </div>
              <div>
                <Label>GBP (Sterlin) kur değeri</Label>
                <Input
                  name="rateGbp"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  defaultValue={settings.exchangeRates.GBP}
                  required
                />
              </div>
              <div>
                <Label>TRY (TL) kur değeri</Label>
                <Input
                  name="rateTry"
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={settings.exchangeRates.TRY}
                  required
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Güncel: EUR {settings.exchangeRates.EUR} · GBP{" "}
              {settings.exchangeRates.GBP} · TRY {settings.exchangeRates.TRY}
              {" · "}
              Örnek 100 EUR →{" "}
              {(
                (100 / Number(settings.exchangeRates.EUR || 1)) *
                Number(settings.exchangeRates.GBP || 1)
              ).toFixed(2)}{" "}
              £ /{" "}
              {(
                (100 / Number(settings.exchangeRates.EUR || 1)) *
                Number(settings.exchangeRates.TRY || 1)
              ).toFixed(2)}{" "}
              ₺
            </p>
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Kaydediliyor..." : "Ayarları kaydet"}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
