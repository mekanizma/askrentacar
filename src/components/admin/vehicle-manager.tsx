"use client";

import Image from "next/image";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
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
import { useBookings, useCategories, useVehicles } from "@/hooks/use-data";
import { localize, vehicleService } from "@/services";
import { useLocale } from "@/providers/locale-provider";
import { slugify } from "@/utils/format";
import type {
  Category,
  CurrencyCode,
  FuelType,
  LocaleCode,
  LocalizedString,
  MediaAsset,
  Transmission,
  Vehicle,
  VehicleBlockedPeriod,
  VehicleStatus,
} from "@/types";

const FEATURES = [
  "apple-carplay",
  "android-auto",
  "cruise-control",
  "parking-sensors",
  "rear-camera",
  "leather-seats",
  "panoramic-roof",
  "navigation",
  "bluetooth",
  "keyless",
  "lane-assist",
  "adaptive-cruise",
] as const;

const statusLabels: Record<VehicleStatus, string> = {
  available: "Müsait",
  rented: "Kirada",
  maintenance: "Bakımda",
  inactive: "Pasif",
};

function toDateInput(value: string | undefined) {
  return value ? value.slice(0, 10) : "";
}

function dateToIso(value: FormDataEntryValue | null, fallback: string) {
  const text = String(value || "");
  return text ? new Date(`${text}T12:00:00`).toISOString() : fallback;
}

function sectionClass() {
  return "rounded-2xl border border-white/10 bg-white/[0.025] p-4 open:bg-white/[0.04]";
}

async function optimizeImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxDimension = 1200;
  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Görsel işlenemedi");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/webp", 0.72);
}

async function translateDescription(
  text: string,
  sourceLocale: LocaleCode,
): Promise<LocalizedString> {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, sourceLocale }),
  });
  if (!response.ok) throw new Error("Çeviri servisine ulaşılamadı");
  const payload = (await response.json()) as {
    translations: LocalizedString;
  };
  return payload.translations;
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function VehicleManager() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<VehicleStatus | "">("");
  const [editing, setEditing] = useState<Vehicle | "new" | null>(null);
  const { data, isLoading } = useVehicles({
    q: q || undefined,
    status: status || undefined,
    pageSize: 120,
  });
  const { data: categories } = useCategories();
  const queryClient = useQueryClient();
  const template = data?.data[0];

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold">
            Filo Yönetimi
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Araçlar</h1>
          <p className="mt-1 text-sm text-slate-400">
            Araç bilgileri, medya, fiyat ve müsaitlik takvimini tek yerden
            yönetin.
          </p>
        </div>
        <Button onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Yeni Araç
        </Button>
      </header>

      {editing && template && (
        <VehicleEditor
          key={editing === "new" ? "new" : editing.id}
          vehicle={editing === "new" ? undefined : editing}
          template={template}
          categories={categories ?? []}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            await refresh();
            setEditing(null);
          }}
        />
      )}

      <Card className="grid gap-3 rounded-2xl p-4 sm:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
          <Input
            className="pl-9"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Marka, model veya plaka ara"
            aria-label="Araç ara"
          />
        </div>
        <Select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as VehicleStatus | "")
          }
          aria-label="Duruma göre filtrele"
        >
          <option value="">Tüm durumlar</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Card>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="grid gap-3">
          {(data?.data ?? []).map((vehicle) => (
            <Card
              key={vehicle.id}
              className="grid gap-4 rounded-2xl p-4 sm:grid-cols-[144px_1fr_auto] sm:items-center"
            >
              <div className="relative h-28 overflow-hidden rounded-xl">
                <Image
                  src={vehicle.images[0]?.url || "/logo.png"}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  fill
                  unoptimized={vehicle.images[0]?.url.startsWith("data:")}
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    {vehicle.brand} {vehicle.model}
                  </h2>
                  <Badge>{statusLabels[vehicle.status]}</Badge>
                  {vehicle.featured && (
                    <Badge className="text-gold">Öne Çıkan</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {vehicle.plate} · {vehicle.specs.year} ·{" "}
                  {vehicle.mileage.toLocaleString("tr-TR")} km
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                  <span>
                    Günlük{" "}
                    {new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: vehicle.pricing.currency,
                      maximumFractionDigits: 0,
                    }).format(vehicle.pricing.daily)}
                  </span>
                  <span>{vehicle.images.length} görsel</span>
                  <span>
                    {vehicle.blockedPeriods?.length ?? 0} kapalı dönem
                  </span>
                </div>
              </div>
              <div className="flex gap-2 sm:justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditing(vehicle)}
                  aria-label={`${vehicle.brand} ${vehicle.model} düzenle`}
                >
                  <Pencil className="h-4 w-4" /> Düzenle
                </Button>
                <Button
                  size="icon"
                  variant="danger"
                  aria-label={`${vehicle.brand} ${vehicle.model} sil`}
                  onClick={async () => {
                    if (
                      !window.confirm(
                        `${vehicle.brand} ${vehicle.model} silinsin mi?`,
                      )
                    )
                      return;
                    await vehicleService.remove(vehicle.id);
                    toast.success("Araç silindi");
                    await refresh();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function VehicleEditor({
  vehicle,
  template,
  categories,
  onClose,
  onSaved,
}: {
  vehicle?: Vehicle;
  template: Vehicle;
  categories: Category[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const base = vehicle ?? template;
  const { locale, t } = useLocale();
  const [images, setImages] = useState<MediaAsset[]>(
    vehicle?.images.filter((image) => image.type === "image") ?? [],
  );
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [blockedPeriods, setBlockedPeriods] = useState<VehicleBlockedPeriod[]>(
    vehicle?.blockedPeriods ?? [],
  );
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const { data: bookings } = useBookings({
    vehicleId: vehicle?.id,
    pageSize: 250,
  });

  function addImage(url: string, alt = `${base.brand} ${base.model}`) {
    const clean = url.trim();
    if (!clean) return;
    setImages((current) => [
      ...current,
      {
        id: `img_admin_${Date.now()}_${current.length}`,
        url: clean,
        alt,
        type: "image",
        order: current.length,
      },
    ]);
    setImageUrl("");
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next.map((image, order) => ({ ...image, order }));
    });
  }

  async function handleUploads(files: FileList | File[]) {
    const selected = Array.from(files).slice(0, 10);
    if (!selected.length) return;

    const supported = selected.filter(
      (file) =>
        ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
        file.size <= 10_000_000,
    );
    if (supported.length !== selected.length) {
      toast.error(
        "Yalnızca 10 MB altındaki JPG, PNG ve WEBP görselleri yüklenebilir",
      );
    }
    if (!supported.length) return;

    setIsUploading(true);
    try {
      const uploaded = await Promise.all(
        supported.map(async (file, index) => ({
          id: `img_upload_${Date.now()}_${index}`,
          url: await optimizeImage(file),
          alt: file.name.replace(/\.[^.]+$/, ""),
          type: "image" as const,
          order: 0,
        })),
      );
      setImages((current) =>
        [...current, ...uploaded].map((image, order) => ({ ...image, order })),
      );
      toast.success(`${uploaded.length} görsel bilgisayardan yüklendi`);
    } catch {
      toast.error("Görseller yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  }

  function addBlockedPeriod() {
    if (!blockStart || !blockEnd || new Date(blockStart) > new Date(blockEnd)) {
      toast.error("Geçerli bir başlangıç ve bitiş tarihi seçin");
      return;
    }
    setBlockedPeriods((current) => [
      ...current,
      {
        id: `block_${Date.now()}`,
        start: new Date(`${blockStart}T00:00:00`).toISOString(),
        end: new Date(`${blockEnd}T23:59:59`).toISOString(),
        reason: blockReason.trim() || "Admin tarafından kapatıldı",
      },
    ]);
    setBlockStart("");
    setBlockEnd("");
    setBlockReason("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!images.length) {
      toast.error("En az bir araç görseli ekleyin");
      return;
    }
    const data = new FormData(event.currentTarget);
    const brand = String(data.get("brand") || "").trim();
    const model = String(data.get("model") || "").trim();
    if (!brand || !model) return;
    const sourceDescription = String(data.get("description") || "").trim();
    const fallbackDescription: LocalizedString = vehicle
      ? { ...vehicle.description, [locale]: sourceDescription }
      : {
          tr: sourceDescription,
          en: sourceDescription,
          ru: sourceDescription,
        };
    let localizedDescription = fallbackDescription;

    setSaving(true);
    if (sourceDescription) {
      try {
        localizedDescription = await translateDescription(
          sourceDescription,
          locale,
        );
      } catch {
        toast.error(
          "Otomatik çeviri şu anda kullanılamıyor. Kaynak açıklama kaydedilecek.",
        );
      }
    }

    const next: Omit<Vehicle, "id" | "createdAt" | "updatedAt"> = {
      slug: vehicle?.slug ?? `${slugify(`${brand}-${model}`)}-${Date.now()}`,
      brand,
      model,
      plate: String(data.get("plate") || ""),
      chassis: String(data.get("chassis") || ""),
      categoryId: String(data.get("categoryId") || categories[0]?.id || ""),
      status: String(data.get("status")) as VehicleStatus,
      featured: data.get("featured") === "on",
      rating: vehicle?.rating ?? 5,
      reviewCount: vehicle?.reviewCount ?? 0,
      mileage: Number(data.get("mileage") || 0),
      specs: {
        year: Number(data.get("year") || new Date().getFullYear()),
        fuel: String(data.get("fuel")) as FuelType,
        transmission: String(data.get("transmission")) as Transmission,
        seats: Number(data.get("seats") || 5),
        bags: Number(data.get("bags") || 2),
        doors: Number(data.get("doors") || 4),
        ac: data.get("ac") === "on",
        engine: String(data.get("engine") || ""),
        horsepower: Number(data.get("horsepower") || 0),
        consumption: String(data.get("consumption") || ""),
        drivetrain: String(data.get("drivetrain") || ""),
      },
      pricing: {
        daily: Number(data.get("daily") || 0),
        weekly: Number(data.get("weekly") || 0),
        monthly: Number(data.get("monthly") || 0),
        currency: String(data.get("currency") || "EUR") as CurrencyCode,
        discountPercent: Number(data.get("discountPercent") || 0),
        deposit: Number(data.get("deposit") || 0),
        insuranceDaily: Number(data.get("insuranceDaily") || 0),
      },
      features: FEATURES.filter(
        (feature) => data.get(`feature_${feature}`) === "on",
      ),
      images: images.map((image, order) => ({
        ...image,
        order,
        type: "image",
      })),
      description: localizedDescription,
      insuranceExpiry: dateToIso(
        data.get("insuranceExpiry"),
        base.insuranceExpiry,
      ),
      maintenanceDue: dateToIso(
        data.get("maintenanceDue"),
        base.maintenanceDue,
      ),
      inspectionDue: dateToIso(data.get("inspectionDue"), base.inspectionDue),
      blockedPeriods,
    };

    try {
      if (vehicle) await vehicleService.update(vehicle.id, next);
      else await vehicleService.create(next);
      toast.success(
        vehicle ? "Araç bilgileri güncellendi" : "Yeni araç eklendi",
      );
      await onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Araç kaydedilemedi",
      );
    } finally {
      setSaving(false);
    }
  }

  const firstDay = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1,
  );
  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0,
  ).getDate();
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const calendarCells = [
    ...Array.from({ length: mondayOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  function dayState(day: number) {
    const start = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day,
      0,
      0,
      0,
    );
    const end = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day,
      23,
      59,
      59,
    );
    const booked = (vehicle ? (bookings?.data ?? []) : []).some(
      (booking) =>
        booking.status !== "cancelled" &&
        start < new Date(booking.returnAt) &&
        end > new Date(booking.pickupAt),
    );
    const blocked = blockedPeriods.some(
      (period) => start < new Date(period.end) && end > new Date(period.start),
    );
    return booked ? "booked" : blocked ? "blocked" : "free";
  }

  return (
    <Card className="relative rounded-[2rem] border-gold/20 p-4 shadow-2xl md:p-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/5 p-2 hover:bg-white/10"
        aria-label="Düzenleyiciyi kapat"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="mb-6 pr-12">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">
          {vehicle ? "Araç Düzenle" : "Yeni Araç"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold">
          {vehicle ? `${vehicle.brand} ${vehicle.model}` : "Filo kaydı oluştur"}
        </h2>
      </div>

      <form id="vehicle-editor-form" onSubmit={save} className="space-y-4">
        <details open className={sectionClass()}>
          <summary className="cursor-pointer font-semibold">
            Temel Bilgiler
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Marka">
              <Input
                name="brand"
                defaultValue={vehicle?.brand ?? ""}
                required
              />
            </Field>
            <Field label="Model">
              <Input
                name="model"
                defaultValue={vehicle?.model ?? ""}
                required
              />
            </Field>
            <Field label="Kategori">
              <Select
                name="categoryId"
                defaultValue={vehicle?.categoryId ?? categories[0]?.id}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {localize(category.name, locale)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Durum">
              <Select
                name="status"
                defaultValue={vehicle?.status ?? "available"}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Plaka">
              <Input
                name="plate"
                defaultValue={vehicle?.plate ?? ""}
                required
              />
            </Field>
            <Field label="Şasi Numarası">
              <Input
                name="chassis"
                defaultValue={vehicle?.chassis ?? ""}
                required
              />
            </Field>
            <Field label="Model Yılı">
              <Input
                name="year"
                type="number"
                min="2000"
                max="2035"
                defaultValue={vehicle?.specs.year ?? new Date().getFullYear()}
              />
            </Field>
            <Field label="Kilometre">
              <Input
                name="mileage"
                type="number"
                min="0"
                defaultValue={vehicle?.mileage ?? 0}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                name="featured"
                type="checkbox"
                defaultChecked={vehicle?.featured ?? false}
              />
              Ana sayfada öne çıkar
            </label>
          </div>
        </details>

        <details open className={sectionClass()}>
          <summary className="cursor-pointer font-semibold">
            Teknik Özellikler
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Yakıt">
              <Select
                name="fuel"
                defaultValue={vehicle?.specs.fuel ?? "petrol"}
              >
                <option value="petrol">Benzin</option>
                <option value="diesel">Dizel</option>
                <option value="hybrid">Hibrit</option>
                <option value="electric">Elektrik</option>
              </Select>
            </Field>
            <Field label="Vites">
              <Select
                name="transmission"
                defaultValue={vehicle?.specs.transmission ?? "automatic"}
              >
                <option value="automatic">Otomatik</option>
                <option value="manual">Manuel</option>
              </Select>
            </Field>
            <Field label="Motor">
              <Input name="engine" defaultValue={vehicle?.specs.engine ?? ""} />
            </Field>
            <Field label="Beygir Gücü">
              <Input
                name="horsepower"
                type="number"
                min="0"
                defaultValue={vehicle?.specs.horsepower ?? 120}
              />
            </Field>
            <Field label="Koltuk">
              <Input
                name="seats"
                type="number"
                min="1"
                defaultValue={vehicle?.specs.seats ?? 5}
              />
            </Field>
            <Field label="Bagaj">
              <Input
                name="bags"
                type="number"
                min="0"
                defaultValue={vehicle?.specs.bags ?? 2}
              />
            </Field>
            <Field label="Kapı">
              <Input
                name="doors"
                type="number"
                min="2"
                defaultValue={vehicle?.specs.doors ?? 4}
              />
            </Field>
            <Field label="Tüketim">
              <Input
                name="consumption"
                defaultValue={vehicle?.specs.consumption ?? ""}
              />
            </Field>
            <Field label="Çekiş">
              <Input
                name="drivetrain"
                defaultValue={vehicle?.specs.drivetrain ?? "FWD"}
                placeholder="FWD / RWD / AWD"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                name="ac"
                type="checkbox"
                defaultChecked={vehicle?.specs.ac ?? true}
              />
              Klima
            </label>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <label
                key={feature}
                className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-3 text-sm"
              >
                <input
                  name={`feature_${feature}`}
                  type="checkbox"
                  defaultChecked={vehicle?.features.includes(feature) ?? false}
                />
                {t(`feature.${feature}`)}
              </label>
            ))}
          </div>
        </details>

        <details open className={sectionClass()}>
          <summary className="cursor-pointer font-semibold">
            Fiyatlandırma
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Fiyat Para Birimi">
              <Select
                name="currency"
                defaultValue={vehicle?.pricing.currency ?? "EUR"}
              >
                <option value="EUR">Euro (€)</option>
                <option value="GBP">İngiliz Sterlini (£)</option>
                <option value="TRY">Türk Lirası (₺)</option>
              </Select>
            </Field>
            <Field label="Günlük Fiyat">
              <Input
                name="daily"
                type="number"
                min="0"
                defaultValue={vehicle?.pricing.daily ?? 75}
              />
            </Field>
            <Field label="Haftalık Fiyat">
              <Input
                name="weekly"
                type="number"
                min="0"
                defaultValue={vehicle?.pricing.weekly ?? 450}
              />
            </Field>
            <Field label="Aylık Fiyat">
              <Input
                name="monthly"
                type="number"
                min="0"
                defaultValue={vehicle?.pricing.monthly ?? 1600}
              />
            </Field>
            <Field label="İndirim (%)">
              <Input
                name="discountPercent"
                type="number"
                min="0"
                max="100"
                defaultValue={vehicle?.pricing.discountPercent ?? 0}
              />
            </Field>
            <Field label="Depozito">
              <Input
                name="deposit"
                type="number"
                min="0"
                defaultValue={vehicle?.pricing.deposit ?? 300}
              />
            </Field>
            <Field label="Günlük Sigorta">
              <Input
                name="insuranceDaily"
                type="number"
                min="0"
                defaultValue={vehicle?.pricing.insuranceDaily ?? 15}
              />
            </Field>
          </div>
        </details>

        <details className={sectionClass()}>
          <summary className="cursor-pointer font-semibold">
            Açıklamalar ve Tarihler
          </summary>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Field
              label={`Açıklama (${
                locale === "tr"
                  ? "Türkçe"
                  : locale === "en"
                    ? "İngilizce"
                    : "Rusça"
              })`}
              className="lg:col-span-3"
            >
              <Textarea
                name="description"
                defaultValue={vehicle?.description[locale] ?? ""}
                className="min-h-32"
                maxLength={2000}
                required
              />
              <p className="mt-2 text-xs text-slate-500">
                Bu metin kaydedilirken sitenin diğer dilleri için otomatik
                çevrilir.
              </p>
            </Field>
            <Field label="Sigorta Bitiş">
              <Input
                name="insuranceExpiry"
                type="date"
                defaultValue={toDateInput(vehicle?.insuranceExpiry)}
              />
            </Field>
            <Field label="Bakım Tarihi">
              <Input
                name="maintenanceDue"
                type="date"
                defaultValue={toDateInput(vehicle?.maintenanceDue)}
              />
            </Field>
            <Field label="Muayene Tarihi">
              <Input
                name="inspectionDue"
                type="date"
                defaultValue={toDateInput(vehicle?.inspectionDue)}
              />
            </Field>
          </div>
        </details>

        <details open className={sectionClass()}>
          <summary className="cursor-pointer font-semibold">
            Araç Görselleri
          </summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://... görsel adresi"
              aria-label="Görsel adresi"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => addImage(imageUrl)}
            >
              <ImagePlus className="h-4 w-4" /> URL Ekle
            </Button>
          </div>
          <div className="mt-4">
            <Label htmlFor="vehicle-image-upload">
              Bilgisayardan görsel yükle
            </Label>
            <div
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                event.preventDefault();
                if (
                  !event.currentTarget.contains(event.relatedTarget as Node)
                ) {
                  setIsDragging(false);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                void handleUploads(event.dataTransfer.files);
              }}
              className={
                "relative rounded-2xl border border-dashed p-6 text-center transition sm:p-8 " +
                (isDragging
                  ? "border-gold bg-gold/10"
                  : "border-white/15 bg-white/[0.025] hover:border-gold/40 hover:bg-white/[0.045]")
              }
            >
              <input
                id="vehicle-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={isUploading}
                className="sr-only"
                onChange={(event) => {
                  if (event.target.files)
                    void handleUploads(event.target.files);
                  event.target.value = "";
                }}
              />
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gold/10">
                {isUploading ? (
                  <LoaderCircle className="h-6 w-6 animate-spin text-gold" />
                ) : (
                  <UploadCloud className="h-6 w-6 text-gold" />
                )}
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                {isUploading
                  ? "Görseller hazırlanıyor…"
                  : "Görselleri buraya sürükleyin"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                veya bilgisayarınızdan dosya seçin
              </p>
              <label
                htmlFor="vehicle-image-upload"
                className="focus-ring mt-4 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/15"
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                Bilgisayardan Seç
              </label>
              <p className="mt-3 text-[11px] text-slate-600">
                JPG, PNG veya WEBP · En fazla 10 görsel · Görsel başına 10 MB
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Görseller yüklenirken web için otomatik optimize edilir. İlk görsel
            kapak görselidir. Oklarla sıralamayı değiştirebilirsiniz.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
              >
                <div className="relative aspect-video">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    unoptimized={image.url.startsWith("data:")}
                    className="object-cover"
                  />
                  {index === 0 && (
                    <Badge className="absolute left-2 top-2 bg-gold text-slate-950">
                      Kapak
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-2">
                  <GripVertical className="h-4 w-4 text-slate-500" />
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() => moveImage(index, -1)}
                      aria-label="Görseli sola taşı"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={index === images.length - 1}
                      onClick={() => moveImage(index, 1)}
                      aria-label="Görseli sağa taşı"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="danger"
                      onClick={() =>
                        setImages((current) =>
                          current
                            .filter((item) => item.id !== image.id)
                            .map((item, order) => ({ ...item, order })),
                        )
                      }
                      aria-label="Görseli sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>

        <details open className={sectionClass()}>
          <summary className="cursor-pointer font-semibold">
            Müsaitlik ve Takvim
          </summary>
          <div className="mt-4 grid gap-6 xl:grid-cols-[1fr_360px]">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-medium capitalize">
                  {calendarMonth.toLocaleDateString("tr-TR", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
                {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(
                  (day) => (
                    <div key={day} className="py-2">
                      {day}
                    </div>
                  ),
                )}
                {calendarCells.map((day, index) => {
                  const state = day ? dayState(day) : "empty";
                  return (
                    <div
                      key={`${day ?? "empty"}-${index}`}
                      title={
                        state === "booked"
                          ? "Rezervasyon var"
                          : state === "blocked"
                            ? "Admin tarafından kapalı"
                            : "Müsait"
                      }
                      className={
                        "grid aspect-square place-items-center rounded-lg text-xs " +
                        (state === "booked"
                          ? "bg-blue-500/20 text-blue-200"
                          : state === "blocked"
                            ? "bg-rose-500/20 text-rose-200"
                            : state === "free"
                              ? "bg-emerald-500/10 text-emerald-200"
                              : "")
                      }
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <i className="h-2.5 w-2.5 rounded-full bg-emerald-400" />{" "}
                  Müsait
                </span>
                <span className="flex items-center gap-2">
                  <i className="h-2.5 w-2.5 rounded-full bg-blue-400" />{" "}
                  Rezervasyon
                </span>
                <span className="flex items-center gap-2">
                  <i className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Kapalı
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3 rounded-2xl bg-white/[0.04] p-4">
                <div className="flex items-center gap-2 font-medium">
                  <CalendarDays className="h-4 w-4 text-gold" />
                  Tarih Aralığını Kapat
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Başlangıç">
                    <Input
                      type="date"
                      value={blockStart}
                      onChange={(event) => setBlockStart(event.target.value)}
                    />
                  </Field>
                  <Field label="Bitiş">
                    <Input
                      type="date"
                      value={blockEnd}
                      onChange={(event) => setBlockEnd(event.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Neden">
                  <Input
                    value={blockReason}
                    onChange={(event) => setBlockReason(event.target.value)}
                    placeholder="Bakım, özel kullanım..."
                  />
                </Field>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={addBlockedPeriod}
                >
                  Takvimde Kapat
                </Button>
              </div>

              <div className="space-y-2">
                {blockedPeriods.map((period) => (
                  <div
                    key={period.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-rose-400/10 bg-rose-500/5 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{period.reason}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(period.start).toLocaleDateString("tr-TR")} –{" "}
                        {new Date(period.end).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setBlockedPeriods((current) =>
                          current.filter((item) => item.id !== period.id),
                        )
                      }
                      className="text-rose-300 hover:text-white"
                      aria-label="Kapalı dönemi sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {!blockedPeriods.length && (
                  <p className="text-sm text-slate-500">
                    Tanımlı kapalı dönem yok.
                  </p>
                )}
              </div>
            </div>
          </div>
        </details>

        <div className="sticky bottom-3 z-30 flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-xl sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button type="submit" disabled={saving}>
            {saving
              ? "Kaydediliyor…"
              : vehicle
                ? "Değişiklikleri Kaydet"
                : "Aracı Oluştur"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
