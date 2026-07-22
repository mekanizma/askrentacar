"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { VehicleCard } from "@/components/cards/vehicle-card";
import { Button } from "@/components/ui/button";
import { Badge, Card, Input, Label, Textarea } from "@/components/ui/primitives";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";
import { bookingService, contentService, vehicleService } from "@/services";
import type { Booking, BookingStatus, LocaleCode } from "@/types";

export type AccountMode = "dashboard" | "profile" | "bookings" | "favorites" | "documents" | "invoices" | "notifications";

const dateLocale: Record<LocaleCode, string> = {
  tr: "tr-TR",
  en: "en-GB",
  ru: "ru-RU",
};

const copy: Record<
  LocaleCode,
  {
    dashboardTitle: string;
    dashboardDesc: string;
    bookingsTitle: string;
    bookingsDesc: string;
    totalBookings: string;
    upcoming: string;
    completed: string;
    loadingBookings: string;
    noBookings: string;
    bookingUpdated: string;
    pdf: string;
    cancel: string;
    delete: string;
    profileTitle: string;
    firstName: string;
    lastName: string;
    phone: string;
    licenseNumber: string;
    passportNumber: string;
    saveProfile: string;
    favoritesTitle: string;
    favoritesDesc: string;
    loading: string;
    noFavorites: string;
    documentsTitle: string;
    documentsDesc: string;
    drivingLicense: string;
    passportId: string;
    documentNotes: string;
    saveDocumentNotes: string;
    licenseFile: string;
    passportFile: string;
    invoicesTitle: string;
    noInvoices: string;
    notificationsTitle: string;
    markRead: string;
    noNotifications: string;
    bookingStatus: Record<BookingStatus, string>;
    invoiceStatus: Record<string, string>;
  }
> = {
  tr: {
    dashboardTitle: "Panel",
    dashboardDesc: "Kiralama etkinliğinize hızlı bir bakış.",
    bookingsTitle: "Rezervasyonlarınız",
    bookingsDesc: "Rezervasyonlarınızı inceleyin veya yönetin.",
    totalBookings: "Toplam rezervasyon",
    upcoming: "Yaklaşan",
    completed: "Tamamlanan",
    loadingBookings: "Rezervasyonlar yükleniyor…",
    noBookings: "Henüz rezervasyon yok.",
    bookingUpdated: "Rezervasyon güncellendi",
    pdf: "PDF",
    cancel: "İptal",
    delete: "Sil",
    profileTitle: "Profil",
    firstName: "Ad",
    lastName: "Soyad",
    phone: "Telefon",
    licenseNumber: "Ehliyet numarası",
    passportNumber: "Pasaport numarası",
    saveProfile: "Profili kaydet",
    favoritesTitle: "Favoriler",
    favoritesDesc: "Kaydettiğiniz premium araçlar.",
    loading: "Yükleniyor…",
    noFavorites: "Henüz favori kaydedilmedi.",
    documentsTitle: "Belgeler",
    documentsDesc: "Demo yüklemeler yalnızca dosya adlarını ve notları saklar; dosyalar cihazınızdan çıkmaz.",
    drivingLicense: "Ehliyet",
    passportId: "Pasaport / Kimlik",
    documentNotes: "Belge notları",
    saveDocumentNotes: "Belge notlarını kaydet",
    licenseFile: "Ehliyet dosyası",
    passportFile: "Pasaport dosyası",
    invoicesTitle: "Faturalar",
    noInvoices: "Fatura bulunmuyor.",
    notificationsTitle: "Bildirimler",
    markRead: "Okundu işaretle",
    noNotifications: "Bildirim yok.",
    bookingStatus: {
      pending: "Beklemede",
      confirmed: "Onaylandı",
      delivered: "Teslim edildi",
      cancelled: "İptal edildi",
      completed: "Tamamlandı",
    },
    invoiceStatus: {
      paid: "Ödendi",
      due: "Ödenecek",
      void: "İptal",
    },
  },
  en: {
    dashboardTitle: "Dashboard",
    dashboardDesc: "A quick overview of your rental activity.",
    bookingsTitle: "Your bookings",
    bookingsDesc: "Review or manage your reservations.",
    totalBookings: "Total bookings",
    upcoming: "Upcoming",
    completed: "Completed",
    loadingBookings: "Loading bookings…",
    noBookings: "No bookings yet.",
    bookingUpdated: "Booking updated",
    pdf: "PDF",
    cancel: "Cancel",
    delete: "Delete",
    profileTitle: "Profile",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    licenseNumber: "License number",
    passportNumber: "Passport number",
    saveProfile: "Save profile",
    favoritesTitle: "Favorites",
    favoritesDesc: "Your saved premium vehicles.",
    loading: "Loading…",
    noFavorites: "No favorites saved yet.",
    documentsTitle: "Documents",
    documentsDesc: "Demo uploads store file names and notes only; files never leave your device.",
    drivingLicense: "Driving license",
    passportId: "Passport / ID",
    documentNotes: "Document notes",
    saveDocumentNotes: "Save document notes",
    licenseFile: "License file",
    passportFile: "Passport file",
    invoicesTitle: "Invoices",
    noInvoices: "No invoices available.",
    notificationsTitle: "Notifications",
    markRead: "Mark read",
    noNotifications: "No notifications.",
    bookingStatus: {
      pending: "Pending",
      confirmed: "Confirmed",
      delivered: "Delivered",
      cancelled: "Cancelled",
      completed: "Completed",
    },
    invoiceStatus: {
      paid: "Paid",
      due: "Due",
      void: "Void",
    },
  },
  ru: {
    dashboardTitle: "Панель",
    dashboardDesc: "Краткий обзор вашей аренды.",
    bookingsTitle: "Ваши бронирования",
    bookingsDesc: "Просматривайте и управляйте бронированиями.",
    totalBookings: "Всего бронирований",
    upcoming: "Предстоящие",
    completed: "Завершённые",
    loadingBookings: "Загрузка бронирований…",
    noBookings: "Бронирований пока нет.",
    bookingUpdated: "Бронирование обновлено",
    pdf: "PDF",
    cancel: "Отменить",
    delete: "Удалить",
    profileTitle: "Профиль",
    firstName: "Имя",
    lastName: "Фамилия",
    phone: "Телефон",
    licenseNumber: "Номер прав",
    passportNumber: "Номер паспорта",
    saveProfile: "Сохранить профиль",
    favoritesTitle: "Избранное",
    favoritesDesc: "Сохранённые премиальные автомобили.",
    loading: "Загрузка…",
    noFavorites: "Избранное пока пусто.",
    documentsTitle: "Документы",
    documentsDesc: "В демо сохраняются только имена файлов и заметки; файлы не покидают устройство.",
    drivingLicense: "Водительские права",
    passportId: "Паспорт / ID",
    documentNotes: "Заметки по документам",
    saveDocumentNotes: "Сохранить заметки",
    licenseFile: "Файл прав",
    passportFile: "Файл паспорта",
    invoicesTitle: "Счета",
    noInvoices: "Счетов нет.",
    notificationsTitle: "Уведомления",
    markRead: "Отметить прочитанным",
    noNotifications: "Уведомлений нет.",
    bookingStatus: {
      pending: "Ожидание",
      confirmed: "Подтверждено",
      delivered: "Выдано",
      cancelled: "Отменено",
      completed: "Завершено",
    },
    invoiceStatus: {
      paid: "Оплачен",
      due: "К оплате",
      void: "Аннулирован",
    },
  },
};

function useAccountCopy() {
  const { locale } = useLocale();
  return { locale, t: copy[locale], dateLoc: dateLocale[locale] };
}

function formatStatusLabel(status: string, t: (typeof copy)[LocaleCode]) {
  if (status in t.bookingStatus) return t.bookingStatus[status as BookingStatus];
  if (status in t.invoiceStatus) return t.invoiceStatus[status];
  return status;
}

export default function AccountSection({ mode }: { mode: AccountMode }) {
  const { user } = useAuth();
  if (!user) return null;
  if (mode === "profile") return <Profile />;
  if (mode === "favorites") return <Favorites />;
  if (mode === "documents") return <Documents />;
  if (mode === "invoices") return <Invoices />;
  if (mode === "notifications") return <Notifications />;
  return <BookingArea dashboard={mode === "dashboard"} />;
}

function BookingArea({ dashboard }: { dashboard: boolean }) {
  const { user } = useAuth();
  const { t, dateLoc } = useAccountCopy();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["account-bookings", user?.id],
    queryFn: () => bookingService.list({ userId: user!.id, pageSize: 100 }),
    enabled: !!user,
  });
  const mutation = useMutation({
    mutationFn: async ({ booking, action }: { booking: Booking; action: "cancel" | "delete" }) => {
      if (action === "cancel") {
        await bookingService.update(booking.id, { status: "cancelled" });
      } else {
        await bookingService.remove(booking.id);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["account-bookings", user?.id] });
      toast.success(t.bookingUpdated);
    },
  });
  const bookings = data?.data ?? [];
  if (isLoading) {
    return (
      <Card role="status" aria-live="polite">
        {t.loadingBookings}
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">{dashboard ? t.dashboardTitle : t.bookingsTitle}</h2>
        <p className="mt-1 text-slate-400">{dashboard ? t.dashboardDesc : t.bookingsDesc}</p>
      </div>
      {dashboard && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label={t.totalBookings} value={bookings.length} />
          <Metric
            label={t.upcoming}
            value={bookings.filter((item) => new Date(item.pickupAt) > new Date() && item.status !== "cancelled").length}
          />
          <Metric label={t.completed} value={bookings.filter((item) => item.status === "completed").length} />
        </div>
      )}
      <div className="space-y-3">
        {(dashboard ? bookings.slice(0, 3) : bookings).map((booking) => (
          <Card key={booking.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <strong>{booking.code}</strong>
                <Badge>{formatStatusLabel(booking.status, t)}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {new Date(booking.pickupAt).toLocaleDateString(dateLoc)} – {new Date(booking.returnAt).toLocaleDateString(dateLoc)}
              </p>
              <p className="text-sm text-slate-400">
                {booking.total} {booking.currency}
              </p>
            </div>
            {!dashboard && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    const { downloadBookingPdf } = await import("@/lib/pdf");
                    downloadBookingPdf(booking);
                  }}
                  aria-label={t.pdf}
                >
                  {t.pdf}
                </Button>
                {booking.status !== "cancelled" && booking.status !== "completed" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate({ booking, action: "cancel" })}
                  >
                    {t.cancel}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ booking, action: "delete" })}
                >
                  {t.delete}
                </Button>
              </div>
            )}
          </Card>
        ))}
        {!bookings.length && (
          <Card>
            <p className="text-slate-400">{t.noBookings}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function Profile() {
  const { user, updateProfile } = useAuth();
  const { t } = useAccountCopy();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
    licenseNumber: user?.licenseNumber ?? "",
    passportNumber: user?.passportNumber ?? "",
  });
  const labels = {
    firstName: t.firstName,
    lastName: t.lastName,
    phone: t.phone,
    licenseNumber: t.licenseNumber,
    passportNumber: t.passportNumber,
  } as const;

  return (
    <Card>
      <h2 className="text-2xl font-semibold">{t.profileTitle}</h2>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          await updateProfile(form);
        }}
      >
        {(Object.keys(form) as (keyof typeof form)[]).map((key) => (
          <div key={key}>
            <Label htmlFor={`profile-${key}`}>{labels[key]}</Label>
            <Input
              id={`profile-${key}`}
              required={key === "firstName" || key === "lastName" || key === "phone"}
              value={form[key]}
              aria-label={labels[key]}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
            />
          </div>
        ))}
        <Button className="sm:col-span-2">{t.saveProfile}</Button>
      </form>
    </Card>
  );
}

function Favorites() {
  const { user } = useAuth();
  const { t } = useAccountCopy();
  const { data, isLoading } = useQuery({
    queryKey: ["favorite-vehicles", user?.favoriteVehicleIds],
    queryFn: async () => (await Promise.all((user?.favoriteVehicleIds ?? []).map(vehicleService.byId))).filter((vehicle) => vehicle !== null),
    enabled: !!user,
  });
  return (
    <div>
      <h2 className="text-2xl font-semibold">{t.favoritesTitle}</h2>
      <p className="mt-1 text-slate-400">{t.favoritesDesc}</p>
      {isLoading ? (
        <Card className="mt-5" role="status" aria-live="polite">
          {t.loading}
        </Card>
      ) : (
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data?.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
          {!data?.length && <Card className="md:col-span-2">{t.noFavorites}</Card>}
        </div>
      )}
    </div>
  );
}

function Documents() {
  const { user, updateProfile } = useAuth();
  const { t } = useAccountCopy();
  const [license, setLicense] = useState("");
  const [passport, setPassport] = useState("");
  const [notes, setNotes] = useState(user?.notes ?? "");
  async function save() {
    const fileNote = [license && `${t.licenseFile}: ${license}`, passport && `${t.passportFile}: ${passport}`, notes]
      .filter(Boolean)
      .join("\n");
    await updateProfile({ notes: fileNote });
  }
  return (
    <Card>
      <h2 className="text-2xl font-semibold">{t.documentsTitle}</h2>
      <p className="mt-1 text-sm text-slate-400">{t.documentsDesc}</p>
      <div className="mt-5 space-y-4">
        <div>
          <Label htmlFor="license-file">{t.drivingLicense}</Label>
          <Input
            id="license-file"
            type="file"
            accept="image/*,.pdf"
            aria-label={t.drivingLicense}
            onChange={(event) => setLicense(event.target.files?.[0]?.name ?? "")}
          />
        </div>
        <div>
          <Label htmlFor="passport-file">{t.passportId}</Label>
          <Input
            id="passport-file"
            type="file"
            accept="image/*,.pdf"
            aria-label={t.passportId}
            onChange={(event) => setPassport(event.target.files?.[0]?.name ?? "")}
          />
        </div>
        <div>
          <Label htmlFor="document-notes">{t.documentNotes}</Label>
          <Textarea
            id="document-notes"
            value={notes}
            aria-label={t.documentNotes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
        <Button onClick={save}>{t.saveDocumentNotes}</Button>
      </div>
    </Card>
  );
}

function Invoices() {
  const { user } = useAuth();
  const { t, dateLoc } = useAccountCopy();
  const { data, isLoading } = useQuery({
    queryKey: ["invoices", user?.id],
    queryFn: () => contentService.invoices(user?.id),
    enabled: !!user,
  });
  return (
    <div>
      <h2 className="text-2xl font-semibold">{t.invoicesTitle}</h2>
      <div className="mt-5 space-y-3">
        {isLoading ? (
          <Card role="status" aria-live="polite">
            {t.loading}
          </Card>
        ) : (
          data?.map((invoice) => (
            <Card key={invoice.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <strong>{invoice.number}</strong>
                <p className="text-sm text-slate-400">{new Date(invoice.issuedAt).toLocaleDateString(dateLoc)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{formatStatusLabel(invoice.status, t)}</Badge>
                <span>
                  {invoice.amount} {invoice.currency}
                </span>
              </div>
            </Card>
          ))
        )}
        {!isLoading && !data?.length && <Card>{t.noInvoices}</Card>}
      </div>
    </div>
  );
}

function Notifications() {
  const { user } = useAuth();
  const { t, dateLoc } = useAccountCopy();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => contentService.notifications(user!.id),
    enabled: !!user,
  });
  const markRead = useMutation({
    mutationFn: contentService.markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });
  return (
    <div>
      <h2 className="text-2xl font-semibold">{t.notificationsTitle}</h2>
      <div className="mt-5 space-y-3">
        {isLoading ? (
          <Card role="status" aria-live="polite">
            {t.loading}
          </Card>
        ) : (
          data?.map((item) => (
            <Card key={item.id} className={item.read ? "opacity-70" : "border border-accent/40"}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <strong>{item.title}</strong>
                  <p className="mt-1 text-sm text-slate-300">{item.body}</p>
                  <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString(dateLoc)}</p>
                </div>
                {!item.read && (
                  <Button size="sm" variant="secondary" disabled={markRead.isPending} onClick={() => markRead.mutate(item.id)}>
                    {t.markRead}
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
        {!isLoading && !data?.length && <Card>{t.noNotifications}</Card>}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </Card>
  );
}
