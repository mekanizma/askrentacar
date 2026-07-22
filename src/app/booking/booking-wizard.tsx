"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, Input, Label, Select } from "@/components/ui/primitives";
import { bookingCustomerSchema } from "@/lib/validations";
import { bookingService, localize, vehicleService } from "@/services";
import { useAddOns, useLocations, useVehicles } from "@/hooks/use-data";
import { useAuth } from "@/providers/auth-provider";
import { useCurrency } from "@/providers/currency-provider";
import { useLocale } from "@/providers/locale-provider";
import { BRAND } from "@/constants";
import type { Booking, PriceQuote } from "@/types";
import type { z } from "zod";
import { Camera, IdCard, Upload } from "lucide-react";
import Image from "next/image";
import { cn } from "@/utils/cn";

type CustomerInput = z.infer<typeof bookingCustomerSchema>;

async function compressLicenseImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("invalid-type");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("too-large");
  }
  const bitmap = await createImageBitmap(file);
  const maxDimension = 1000;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("process-failed");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.72);
}

const copy = {
  en: {
    title: "Reservation",
    subtitle: "Premium booking flow with live mock pricing.",
    vehicle: "Vehicle",
    dates: "Dates",
    extras: "Extras",
    details: "Details",
    payment: "Payment",
    confirm: "Done",
    selectVehicle: "Select vehicle",
    choose: "Choose",
    loadingVehicles: "Loading vehicles…",
    noVehicles: "No vehicles available",
    perDay: "day",
    selected: "Selected",
    pickupLocation: "Pickup location",
    dropoffLocation: "Drop-off location",
    select: "Select",
    loadingLocations: "Loading locations…",
    noLocations: "No locations available",
    pickupDate: "Pickup date and time",
    returnDate: "Return date and time",
    loadingExtras: "Loading extras…",
    noExtras: "No extras available",
    campaignCode: "Campaign code",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    notes: "Notes",
    processing: "Submitting…",
    submitRequest: "Submit reservation",
    confirmed: "Request received",
    confirmationText:
      "Your reservation request has been sent. It will be confirmed after admin approval.",
    downloadPdf: "Download PDF",
    shareWhatsapp: "Share on WhatsApp",
    myBookings: "My bookings",
    back: "Back",
    continue: "Continue",
    summary: "Summary",
    noVehicle: "No vehicle selected",
    daysCount: "Days",
    subtotal: "Subtotal",
    discount: "Discount",
    insurance: "Insurance",
    tax: "Tax",
    total: "Total",
    pricingPrompt: "Select a vehicle and dates to see pricing.",
    quoteFailed: "Could not calculate the price.",
    bookingFailed: "Could not complete the booking.",
    emailSent: "Reservation request sent. Waiting for admin approval.",
    customerValidation: "Please complete the customer details.",
    licenseRequired: "Please upload both sides of your driving licence.",
    licenseSection: "Driving licence photos",
    licenseHint: "Upload clear photos of the front and back of your licence.",
    licenseFront: "Licence front",
    licenseBack: "Licence back",
    licenseChoose: "Choose photo",
    licenseChange: "Change photo",
    licensePreview: "Preview",
    bookingConfirmedMessage:
      "My reservation request {code} is waiting for approval.",
    stepsAria: "Booking steps",
    vehicleAria: "Vehicle selection",
    pickupLocationAria: "Pickup location selection",
    dropoffLocationAria: "Drop-off location selection",
    pickupDateAria: "Pickup date and time",
    returnDateAria: "Return date and time",
    campaignAria: "Campaign code",
    addonAria: "Add {name}",
  },
  tr: {
    title: "Rezervasyon",
    subtitle: "Anlık örnek fiyatlandırmayla premium rezervasyon deneyimi.",
    vehicle: "Araç",
    dates: "Tarihler",
    extras: "Ek hizmetler",
    details: "Bilgiler",
    payment: "Ödeme",
    confirm: "Tamam",
    selectVehicle: "Araç seçin",
    choose: "Seçin",
    loadingVehicles: "Araçlar yükleniyor…",
    noVehicles: "Uygun araç bulunamadı",
    perDay: "gün",
    selected: "Seçilen",
    pickupLocation: "Teslim alma noktası",
    dropoffLocation: "İade noktası",
    select: "Seçin",
    loadingLocations: "Konumlar yükleniyor…",
    noLocations: "Uygun konum bulunamadı",
    pickupDate: "Teslim alma tarihi ve saati",
    returnDate: "İade tarihi ve saati",
    loadingExtras: "Ek hizmetler yükleniyor…",
    noExtras: "Ek hizmet bulunamadı",
    campaignCode: "Kampanya kodu",
    firstName: "Ad",
    lastName: "Soyad",
    email: "E-posta",
    phone: "Telefon",
    notes: "Notlar",
    processing: "Gönderiliyor…",
    submitRequest: "Rezervasyon talebi gönder",
    confirmed: "Talep alındı",
    confirmationText:
      "Rezervasyon talebiniz alındı. Admin onayından sonra kesinleşecektir.",
    downloadPdf: "PDF indir",
    shareWhatsapp: "WhatsApp'ta paylaş",
    myBookings: "Rezervasyonlarım",
    back: "Geri",
    continue: "Devam et",
    summary: "Özet",
    noVehicle: "Araç seçilmedi",
    daysCount: "Gün",
    subtotal: "Ara toplam",
    discount: "İndirim",
    insurance: "Sigorta",
    tax: "Vergi",
    total: "Toplam",
    pricingPrompt: "Fiyatı görmek için araç ve tarihleri seçin.",
    quoteFailed: "Fiyat hesaplanamadı.",
    bookingFailed: "Rezervasyon tamamlanamadı.",
    emailSent: "Rezervasyon talebi gönderildi. Admin onayı bekleniyor.",
    customerValidation: "Lütfen müşteri bilgilerini eksiksiz doldurun.",
    licenseRequired: "Lütfen ehliyetinizin ön ve arka yüzünü yükleyin.",
    licenseSection: "Ehliyet fotoğrafları",
    licenseHint: "Ehliyetinizin ön ve arka yüzünün net fotoğraflarını yükleyin.",
    licenseFront: "Ehliyet ön yüz",
    licenseBack: "Ehliyet arka yüz",
    licenseChoose: "Fotoğraf seç",
    licenseChange: "Değiştir",
    licensePreview: "Önizleme",
    bookingConfirmedMessage:
      "{code} kodlu rezervasyon talebim onay bekliyor.",
    stepsAria: "Rezervasyon adımları",
    vehicleAria: "Araç seçimi",
    pickupLocationAria: "Teslim alma noktası seçimi",
    dropoffLocationAria: "İade noktası seçimi",
    pickupDateAria: "Teslim alma tarihi ve saati",
    returnDateAria: "İade tarihi ve saati",
    campaignAria: "Kampanya kodu",
    addonAria: "{name} ekle",
  },
  ru: {
    title: "Бронирование",
    subtitle: "Премиальное бронирование с актуальным тестовым расчётом цены.",
    vehicle: "Автомобиль",
    dates: "Даты",
    extras: "Дополнения",
    details: "Данные",
    payment: "Оплата",
    confirm: "Готово",
    selectVehicle: "Выберите автомобиль",
    choose: "Выберите",
    loadingVehicles: "Автомобили загружаются…",
    noVehicles: "Нет доступных автомобилей",
    perDay: "день",
    selected: "Выбрано",
    pickupLocation: "Место получения",
    dropoffLocation: "Место возврата",
    select: "Выберите",
    loadingLocations: "Места загружаются…",
    noLocations: "Нет доступных мест",
    pickupDate: "Дата и время получения",
    returnDate: "Дата и время возврата",
    loadingExtras: "Дополнения загружаются…",
    noExtras: "Нет доступных дополнений",
    campaignCode: "Промокод",
    firstName: "Имя",
    lastName: "Фамилия",
    email: "Эл. почта",
    phone: "Телефон",
    notes: "Примечания",
    processing: "Отправка…",
    submitRequest: "Отправить заявку",
    confirmed: "Заявка получена",
    confirmationText:
      "Ваша заявка на бронирование отправлена. Она будет подтверждена после одобрения администратором.",
    downloadPdf: "Скачать PDF",
    shareWhatsapp: "Поделиться в WhatsApp",
    myBookings: "Мои бронирования",
    back: "Назад",
    continue: "Продолжить",
    summary: "Итого",
    noVehicle: "Автомобиль не выбран",
    daysCount: "Дни",
    subtotal: "Промежуточный итог",
    discount: "Скидка",
    insurance: "Страхование",
    tax: "Налог",
    total: "Итого",
    pricingPrompt: "Выберите автомобиль и даты, чтобы увидеть цену.",
    quoteFailed: "Не удалось рассчитать цену.",
    bookingFailed: "Не удалось завершить бронирование.",
    emailSent: "Заявка отправлена. Ожидается одобрение администратора.",
    customerValidation: "Пожалуйста, заполните данные клиента.",
    licenseRequired: "Загрузите фото лицевой и оборотной стороны прав.",
    licenseSection: "Фото водительских прав",
    licenseHint: "Загрузите чёткие фото лицевой и оборотной стороны прав.",
    licenseFront: "Лицевая сторона",
    licenseBack: "Оборотная сторона",
    licenseChoose: "Выбрать фото",
    licenseChange: "Изменить",
    licensePreview: "Просмотр",
    bookingConfirmedMessage:
      "Моя заявка на бронирование {code} ожидает одобрения.",
    stepsAria: "Этапы бронирования",
    vehicleAria: "Выбор автомобиля",
    pickupLocationAria: "Выбор места получения",
    dropoffLocationAria: "Выбор места возврата",
    pickupDateAria: "Дата и время получения",
    returnDateAria: "Дата и время возврата",
    campaignAria: "Промокод",
    addonAria: "Добавить {name}",
  },
} as const;

type CopyKey = keyof typeof copy.en;

export default function BookingWizard() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { format, formatFrom } = useCurrency();
  const { locale } = useLocale();
  const language = locale === "tr" || locale === "ru" ? locale : "en";
  const t = useCallback((key: CopyKey) => copy[language][key], [language]);
  const steps = [
    t("vehicle"),
    t("dates"),
    t("extras"),
    t("details"),
    t("confirm"),
  ];
  const { data: fleet, isLoading: fleetLoading } = useVehicles({
    pageSize: 120,
    sort: "popular",
  });
  const { data: locations, isLoading: locationsLoading } = useLocations();
  const { data: addOns, isLoading: addOnsLoading } = useAddOns();

  const [step, setStep] = useState(0);
  const [vehicleSlug, setVehicleSlug] = useState(params.get("vehicle") || "");
  const [pickupLocationId, setPickupLocationId] = useState(
    params.get("pickup") || "",
  );
  const [dropoffLocationId, setDropoffLocationId] = useState(
    params.get("dropoff") || "",
  );
  const [pickupAt, setPickupAt] = useState(
    params.get("from")?.slice(0, 16) || "",
  );
  const [returnAt, setReturnAt] = useState(
    params.get("to")?.slice(0, 16) || "",
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [campaignCode, setCampaignCode] = useState(
    params.get("campaign") || "",
  );
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: vehicle } = useQuery({
    queryKey: ["booking-vehicle", vehicleSlug],
    queryFn: () => vehicleService.bySlug(vehicleSlug),
    enabled: !!vehicleSlug,
  });

  const customerForm = useForm<CustomerInput>({
    resolver: zodResolver(bookingCustomerSchema),
    mode: "onChange",
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      notes: "",
      licenseFrontUrl: "",
      licenseBackUrl: "",
      licenseFrontName: "",
      licenseBackName: "",
    },
  });

  const licenseFrontUrl = customerForm.watch("licenseFrontUrl");
  const licenseBackUrl = customerForm.watch("licenseBackUrl");

  useEffect(() => {
    if (user) {
      customerForm.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        notes: "",
        licenseFrontUrl: customerForm.getValues("licenseFrontUrl") || "",
        licenseBackUrl: customerForm.getValues("licenseBackUrl") || "",
        licenseFrontName: customerForm.getValues("licenseFrontName") || "",
        licenseBackName: customerForm.getValues("licenseBackName") || "",
      });
    }
  }, [user, customerForm]);

  async function handleLicenseUpload(
    side: "front" | "back",
    fileList: FileList | null,
  ) {
    const file = fileList?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressLicenseImage(file);
      if (side === "front") {
        customerForm.setValue("licenseFrontUrl", dataUrl, {
          shouldValidate: true,
          shouldDirty: true,
        });
        customerForm.setValue("licenseFrontName", file.name, {
          shouldDirty: true,
        });
      } else {
        customerForm.setValue("licenseBackUrl", dataUrl, {
          shouldValidate: true,
          shouldDirty: true,
        });
        customerForm.setValue("licenseBackName", file.name, {
          shouldDirty: true,
        });
      }
    } catch {
      toast.error(t("licenseRequired"));
    }
  }

  useEffect(() => {
    async function run() {
      if (!vehicle || !pickupAt || !returnAt) return;
      try {
        const q = await bookingService.quote({
          vehicleId: vehicle.id,
          pickupAt: new Date(pickupAt).toISOString(),
          returnAt: new Date(returnAt).toISOString(),
          addOnIds: selectedAddOns,
          campaignCode: campaignCode || undefined,
        });
        setQuote(q);
      } catch {
        toast.error(t("quoteFailed"));
      }
    }
    void run();
  }, [vehicle, pickupAt, returnAt, selectedAddOns, campaignCode, t]);

  const canNext = useMemo(() => {
    if (step === 0) return !!vehicle;
    if (step === 1)
      return !!(pickupLocationId && dropoffLocationId && pickupAt && returnAt);
    if (step === 2) return true;
    if (step === 3)
      return (
        customerForm.formState.isValid &&
        !!customerForm.getValues("licenseFrontUrl") &&
        !!customerForm.getValues("licenseBackUrl")
      );
    return false;
  }, [
    step,
    vehicle,
    pickupLocationId,
    dropoffLocationId,
    pickupAt,
    returnAt,
    customerForm.formState.isValid,
    licenseFrontUrl,
    licenseBackUrl,
  ]);

  async function submitReservation() {
    if (!vehicle || !quote) return;
    const customer = customerForm.getValues();
    setSubmitting(true);
    try {
      const created = await bookingService.create({
        userId: user?.id || "guest",
        vehicleId: vehicle.id,
        status: "pending",
        pickupLocationId,
        dropoffLocationId,
        pickupAt: new Date(pickupAt).toISOString(),
        returnAt: new Date(returnAt).toISOString(),
        addOns: selectedAddOns.map((id) => {
          const item = addOns?.find((a) => a.id === id);
          return {
            addOnId: id,
            quantity: 1,
            unitPrice: item?.priceDaily || 0,
          };
        }),
        dailyRate: quote.dailyRate,
        days: quote.days,
        subtotal: quote.subtotal,
        discount: quote.discount,
        extrasTotal: quote.extrasTotal,
        insuranceTotal: quote.insuranceTotal,
        tax: quote.tax,
        total: quote.total,
        currency: quote.currency,
        customer: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          licenseFrontUrl: customer.licenseFrontUrl,
          licenseBackUrl: customer.licenseBackUrl,
          licenseFrontName: customer.licenseFrontName,
          licenseBackName: customer.licenseBackName,
        },
        paymentMethod: "cash",
        paymentStatus: "pending",
        notes: customer.notes,
      });
      setBooking(created);
      setStep(4);
      toast.success(t("emailSent"));
    } catch {
      toast.error(t("bookingFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  const whatsappHref = booking
    ? `https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        t("bookingConfirmedMessage").replace("{code}", booking.code),
      )}`
    : "#";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-slate-400">{t("subtitle")}</p>
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-2"
        aria-label={t("stepsAria")}
      >
        {steps.map((label, index) => (
          <div
            key={label}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${
              index === step
                ? "bg-accent text-white"
                : index < step
                  ? "bg-gold/20 text-gold"
                  : "bg-white/5 text-slate-400"
            }`}
          >
            {index + 1}. {label}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="space-y-4">
          {step === 0 && (
            <div className="space-y-3">
              <Label>{t("selectVehicle")}</Label>
              <Select
                aria-label={t("vehicleAria")}
                value={vehicleSlug}
                onChange={(e) => setVehicleSlug(e.target.value)}
              >
                <option value="">
                  {fleetLoading ? t("loadingVehicles") : t("choose")}
                </option>
                {!fleetLoading && fleet?.data.length === 0 && (
                  <option disabled>{t("noVehicles")}</option>
                )}
                {(fleet?.data ?? []).map((v) => (
                  <option key={v.id} value={v.slug}>
                    {v.brand} {v.model} —{" "}
                    {formatFrom(v.pricing.daily, v.pricing.currency)}/
                    {t("perDay")}
                  </option>
                ))}
              </Select>
              {vehicle && (
                <p className="text-sm text-slate-300">
                  {t("selected")}: {vehicle.brand} {vehicle.model} (
                  {vehicle.specs.year})
                </p>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>{t("pickupLocation")}</Label>
                <Select
                  aria-label={t("pickupLocationAria")}
                  value={pickupLocationId}
                  onChange={(e) => setPickupLocationId(e.target.value)}
                >
                  <option value="">
                    {locationsLoading ? t("loadingLocations") : t("select")}
                  </option>
                  {!locationsLoading && locations?.length === 0 && (
                    <option disabled>{t("noLocations")}</option>
                  )}
                  {(locations ?? []).map((l) => (
                    <option key={l.id} value={l.id}>
                      {localize(l.name, locale)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>{t("dropoffLocation")}</Label>
                <Select
                  aria-label={t("dropoffLocationAria")}
                  value={dropoffLocationId}
                  onChange={(e) => setDropoffLocationId(e.target.value)}
                >
                  <option value="">
                    {locationsLoading ? t("loadingLocations") : t("select")}
                  </option>
                  {!locationsLoading && locations?.length === 0 && (
                    <option disabled>{t("noLocations")}</option>
                  )}
                  {(locations ?? []).map((l) => (
                    <option key={l.id} value={l.id}>
                      {localize(l.name, locale)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>{t("pickupDate")}</Label>
                <Input
                  aria-label={t("pickupDateAria")}
                  type="datetime-local"
                  value={pickupAt}
                  onChange={(e) => setPickupAt(e.target.value)}
                />
              </div>
              <div>
                <Label>{t("returnDate")}</Label>
                <Input
                  aria-label={t("returnDateAria")}
                  type="datetime-local"
                  value={returnAt}
                  onChange={(e) => setReturnAt(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {addOnsLoading && (
                <p className="text-sm text-slate-400">{t("loadingExtras")}</p>
              )}
              {!addOnsLoading && addOns?.length === 0 && (
                <p className="text-sm text-slate-400">{t("noExtras")}</p>
              )}
              {(addOns ?? []).map((addon) => {
                const checked = selectedAddOns.includes(addon.id);
                return (
                  <label
                    key={addon.id}
                    className="flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-white/10 p-3 hover:bg-white/5"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        aria-label={t("addonAria").replace(
                          "{name}",
                          localize(addon.name, locale),
                        )}
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedAddOns((prev) =>
                            checked
                              ? prev.filter((id) => id !== addon.id)
                              : [...prev, addon.id],
                          )
                        }
                      />
                      <div>
                        <div className="font-medium">
                          {localize(addon.name, locale)}
                        </div>
                        <div className="text-sm text-slate-400">
                          {localize(addon.description, locale)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gold">
                      {format(addon.priceDaily)}/{t("perDay")}
                    </div>
                  </label>
                );
              })}
              <div>
                <Label>{t("campaignCode")}</Label>
                <Input
                  aria-label={t("campaignAria")}
                  value={campaignCode}
                  onChange={(e) =>
                    setCampaignCode(e.target.value.toUpperCase())
                  }
                  placeholder="SUMMER10"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <form
              className="grid gap-3 md:grid-cols-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <Label>{t("firstName")}</Label>
                <Input
                  aria-label={t("firstName")}
                  {...customerForm.register("firstName")}
                />
              </div>
              <div>
                <Label>{t("lastName")}</Label>
                <Input
                  aria-label={t("lastName")}
                  {...customerForm.register("lastName")}
                />
              </div>
              <div>
                <Label>{t("email")}</Label>
                <Input
                  aria-label={t("email")}
                  type="email"
                  {...customerForm.register("email")}
                />
              </div>
              <div>
                <Label>{t("phone")}</Label>
                <Input
                  aria-label={t("phone")}
                  {...customerForm.register("phone")}
                />
              </div>
              <div className="md:col-span-2">
                <Label>{t("notes")}</Label>
                <Input
                  aria-label={t("notes")}
                  {...customerForm.register("notes")}
                />
              </div>

              <div className="md:col-span-2 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-xl border border-gold/30 bg-gold/10 p-2 text-gold">
                    <IdCard className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-medium text-white">{t("licenseSection")}</p>
                    <p className="mt-1 text-sm text-slate-400">{t("licenseHint")}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      {
                        side: "front" as const,
                        label: t("licenseFront"),
                        url: licenseFrontUrl,
                        inputId: "license-front",
                      },
                      {
                        side: "back" as const,
                        label: t("licenseBack"),
                        url: licenseBackUrl,
                        inputId: "license-back",
                      },
                    ] as const
                  ).map((item) => (
                    <div key={item.side} className="space-y-2">
                      <Label htmlFor={item.inputId}>{item.label}</Label>
                      <label
                        htmlFor={item.inputId}
                        className={cn(
                          "relative flex min-h-[11rem] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-black/20 transition hover:border-emerald-400/40 hover:bg-emerald-500/5",
                          item.url && "border-solid border-emerald-400/35",
                        )}
                      >
                        {item.url ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.url}
                              alt={item.label}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                            <span className="absolute inset-x-0 bottom-0 bg-slate-950/75 px-3 py-2 text-center text-xs font-medium text-white backdrop-blur-sm">
                              {t("licenseChange")}
                            </span>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center text-slate-300">
                            <Camera className="h-7 w-7 text-emerald-400" />
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                              <Upload className="h-4 w-4" />
                              {t("licenseChoose")}
                            </span>
                          </div>
                        )}
                        <input
                          id={item.inputId}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="sr-only"
                          aria-label={item.label}
                          onChange={(e) => {
                            void handleLicenseUpload(item.side, e.target.files);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}

          {step === 4 && booking && (
            <div className="space-y-4 text-center">
              <div className="text-sm uppercase tracking-[0.25em] text-amber-300">
                {t("confirmed")}
              </div>
              <h2 className="text-2xl font-semibold">{booking.code}</h2>
              <p className="text-slate-400">{t("confirmationText")}</p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  onClick={async () => {
                    const { downloadBookingPdf } = await import("@/lib/pdf");
                    downloadBookingPdf(booking, vehicle);
                  }}
                >
                  {t("downloadPdf")}
                </Button>
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  <Button variant="secondary" className="w-full">
                    {t("shareWhatsapp")}
                  </Button>
                </a>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/account/bookings")}
                >
                  {t("myBookings")}
                </Button>
              </div>
            </div>
          )}

          {step < 4 && (
            <div className="flex justify-between gap-3 pt-2">
              <Button
                variant="secondary"
                disabled={step === 0 || submitting}
                onClick={() => setStep((s) => s - 1)}
              >
                {t("back")}
              </Button>
              <Button
                disabled={!canNext || submitting}
                onClick={async () => {
                  if (step === 3) {
                    const valid = await customerForm.trigger();
                    const hasLicense =
                      !!customerForm.getValues("licenseFrontUrl") &&
                      !!customerForm.getValues("licenseBackUrl");
                    if (!valid || !hasLicense) {
                      toast.error(
                        !hasLicense
                          ? t("licenseRequired")
                          : t("customerValidation"),
                      );
                      return;
                    }
                    await submitReservation();
                    return;
                  }
                  setStep((s) => s + 1);
                }}
              >
                {step === 3
                  ? submitting
                    ? t("processing")
                    : t("submitRequest")
                  : t("continue")}
              </Button>
            </div>
          )}
        </Card>

        <Card className="h-fit space-y-3 overflow-hidden p-0 sm:sticky sm:top-28">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
            {vehicle?.images[0]?.url ? (
              <Image
                src={vehicle.images[0].url}
                alt={`${vehicle.brand} ${vehicle.model}`}
                fill
                sizes="(max-width: 1024px) 100vw, 320px"
                className="object-cover"
                priority={false}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-xs text-slate-500">
                {t("noVehicle")}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            {vehicle && (
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-sm font-semibold text-white">
                  {vehicle.brand} {vehicle.model}
                </p>
                <p className="text-xs text-slate-300">{vehicle.specs.year}</p>
              </div>
            )}
          </div>
          <div className="space-y-3 p-5 pt-1">
            <div className="text-sm uppercase tracking-wide text-gold">
              {t("summary")}
            </div>
            {!vehicle && (
              <div className="text-sm text-slate-300">{t("noVehicle")}</div>
            )}
            {quote ? (
              <div className="space-y-1 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>{t("daysCount")}</span>
                  <span>{quote.days}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("subtotal")}</span>
                  <span>{formatFrom(quote.subtotal, quote.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("discount")}</span>
                  <span>-{formatFrom(quote.discount, quote.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("extras")}</span>
                  <span>{formatFrom(quote.extrasTotal, quote.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("insurance")}</span>
                  <span>
                    {formatFrom(quote.insuranceTotal, quote.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("tax")}</span>
                  <span>{formatFrom(quote.tax, quote.currency)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold text-white">
                  <span>{t("total")}</span>
                  <span>{formatFrom(quote.total, quote.currency)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">{t("pricingPrompt")}</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
