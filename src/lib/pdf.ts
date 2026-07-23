import { jsPDF } from "jspdf";
import { BRAND } from "@/constants";
import type { AddOn, Booking, LocaleCode, Location, Vehicle } from "@/types";

function localize(
  value: { tr: string; en: string; ru: string },
  locale: LocaleCode,
) {
  return value[locale] || value.tr;
}

export type BookingPdfOptions = {
  vehicle?: Vehicle | null;
  locations?: Location[];
  addOns?: AddOn[];
  locale?: LocaleCode;
};

type Copy = {
  documentTitle: string;
  statusLabel: string;
  statuses: Record<Booking["status"], string>;
  customerSection: string;
  fullName: string;
  email: string;
  phone: string;
  license: string;
  licenseYes: string;
  licenseNo: string;
  vehicleSection: string;
  vehicle: string;
  plate: string;
  year: string;
  transmission: string;
  fuel: string;
  seats: string;
  rentalSection: string;
  pickup: string;
  dropoff: string;
  duration: string;
  day: string;
  pricingSection: string;
  dailyRate: string;
  subtotal: string;
  discount: string;
  extras: string;
  insurance: string;
  tax: string;
  total: string;
  addOnsSection: string;
  noAddOns: string;
  paymentSection: string;
  method: string;
  paymentStatus: string;
  paymentMethods: Record<Booking["paymentMethod"], string>;
  paymentStatuses: Record<Booking["paymentStatus"], string>;
  notesSection: string;
  noNotes: string;
  thanks: string;
  generatedAt: string;
  pendingNote: string;
  companyLine: string;
  transmissions: Record<string, string>;
  fuels: Record<string, string>;
};

function getCopy(locale: LocaleCode): Copy {
  const packs: Record<LocaleCode, Copy> = {
    tr: {
      documentTitle: "Rezervasyon Belgesi",
      statusLabel: "Durum",
      statuses: {
        pending: "Onay bekliyor",
        confirmed: "Onaylandı",
        delivered: "Teslim edildi",
        completed: "Tamamlandı",
        cancelled: "İptal",
      },
      customerSection: "Müşteri Bilgileri",
      fullName: "Ad Soyad",
      email: "E-posta",
      phone: "Telefon",
      license: "Ehliyet",
      licenseYes: "Yüklendi",
      licenseNo: "Yüklenmedi",
      vehicleSection: "Araç Bilgileri",
      vehicle: "Araç",
      plate: "Plaka",
      year: "Model yılı",
      transmission: "Vites",
      fuel: "Yakıt",
      seats: "Koltuk",
      rentalSection: "Kiralama Detayları",
      pickup: "Teslim alma",
      dropoff: "İade",
      duration: "Süre",
      day: "gün",
      pricingSection: "Fiyat Dökümü",
      dailyRate: "Günlük ücret",
      subtotal: "Ara toplam",
      discount: "İndirim",
      extras: "Ek hizmetler",
      insurance: "Sigorta",
      tax: "Vergi",
      total: "Genel toplam",
      addOnsSection: "Seçilen Ek Hizmetler",
      noAddOns: "Ek hizmet seçilmedi",
      paymentSection: "Ödeme Bilgileri",
      method: "Ödeme yöntemi",
      paymentStatus: "Ödeme durumu",
      paymentMethods: {
        card: "Kredi / banka kartı",
        cash: "Nakit",
        transfer: "Banka havalesi",
      },
      paymentStatuses: {
        pending: "Bekliyor",
        paid: "Ödendi",
        refunded: "İade edildi",
      },
      notesSection: "Notlar",
      noNotes: "Not bulunmuyor",
      thanks: "ASK RENT A CAR'ı tercih ettiğiniz için teşekkür ederiz.",
      generatedAt: "Belge tarihi",
      pendingNote:
        "Bu belge rezervasyon talebinizi özetler. Kesin onay sonrası rezervasyonunuz aktifleşir.",
      companyLine: "Kuzey Kıbrıs · Premium araç kiralama",
      transmissions: {
        automatic: "Otomatik",
        manual: "Manuel",
      },
      fuels: {
        petrol: "Benzin",
        diesel: "Dizel",
        hybrid: "Hibrit",
        electric: "Elektrik",
      },
    },
    en: {
      documentTitle: "Reservation Document",
      statusLabel: "Status",
      statuses: {
        pending: "Pending approval",
        confirmed: "Confirmed",
        delivered: "Delivered",
        completed: "Completed",
        cancelled: "Cancelled",
      },
      customerSection: "Customer Details",
      fullName: "Full name",
      email: "Email",
      phone: "Phone",
      license: "Driving licence",
      licenseYes: "Uploaded",
      licenseNo: "Not uploaded",
      vehicleSection: "Vehicle Details",
      vehicle: "Vehicle",
      plate: "Plate",
      year: "Year",
      transmission: "Transmission",
      fuel: "Fuel",
      seats: "Seats",
      rentalSection: "Rental Details",
      pickup: "Pickup",
      dropoff: "Return",
      duration: "Duration",
      day: "day(s)",
      pricingSection: "Price Breakdown",
      dailyRate: "Daily rate",
      subtotal: "Subtotal",
      discount: "Discount",
      extras: "Extras",
      insurance: "Insurance",
      tax: "Tax",
      total: "Grand total",
      addOnsSection: "Selected Extras",
      noAddOns: "No extras selected",
      paymentSection: "Payment Details",
      method: "Payment method",
      paymentStatus: "Payment status",
      paymentMethods: {
        card: "Card",
        cash: "Cash",
        transfer: "Bank transfer",
      },
      paymentStatuses: {
        pending: "Pending",
        paid: "Paid",
        refunded: "Refunded",
      },
      notesSection: "Notes",
      noNotes: "No notes",
      thanks: "Thank you for choosing ASK RENT A CAR.",
      generatedAt: "Document date",
      pendingNote:
        "This document summarizes your reservation request. Final confirmation activates the booking.",
      companyLine: "Northern Cyprus · Premium car rental",
      transmissions: {
        automatic: "Automatic",
        manual: "Manual",
      },
      fuels: {
        petrol: "Petrol",
        diesel: "Diesel",
        hybrid: "Hybrid",
        electric: "Electric",
      },
    },
    ru: {
      documentTitle: "Документ бронирования",
      statusLabel: "Статус",
      statuses: {
        pending: "Ожидает подтверждения",
        confirmed: "Подтверждено",
        delivered: "Выдано",
        completed: "Завершено",
        cancelled: "Отменено",
      },
      customerSection: "Данные клиента",
      fullName: "ФИО",
      email: "Эл. почта",
      phone: "Телефон",
      license: "Водительские права",
      licenseYes: "Загружены",
      licenseNo: "Не загружены",
      vehicleSection: "Данные автомобиля",
      vehicle: "Автомобиль",
      plate: "Номер",
      year: "Год",
      transmission: "КПП",
      fuel: "Топливо",
      seats: "Места",
      rentalSection: "Детали аренды",
      pickup: "Получение",
      dropoff: "Возврат",
      duration: "Срок",
      day: "дн.",
      pricingSection: "Расчёт стоимости",
      dailyRate: "Цена за день",
      subtotal: "Промежуточный итог",
      discount: "Скидка",
      extras: "Дополнения",
      insurance: "Страхование",
      tax: "Налог",
      total: "Итого",
      addOnsSection: "Выбранные дополнения",
      noAddOns: "Дополнения не выбраны",
      paymentSection: "Оплата",
      method: "Способ оплаты",
      paymentStatus: "Статус оплаты",
      paymentMethods: {
        card: "Карта",
        cash: "Наличные",
        transfer: "Банковский перевод",
      },
      paymentStatuses: {
        pending: "Ожидается",
        paid: "Оплачено",
        refunded: "Возвращено",
      },
      notesSection: "Примечания",
      noNotes: "Нет примечаний",
      thanks: "Спасибо, что выбрали ASK RENT A CAR.",
      generatedAt: "Дата документа",
      pendingNote:
        "Этот документ отражает заявку на бронирование. После подтверждения бронь станет активной.",
      companyLine: "Северный Кипр · Премиальная аренда авто",
      transmissions: {
        automatic: "Автомат",
        manual: "Механика",
      },
      fuels: {
        petrol: "Бензин",
        diesel: "Дизель",
        hybrid: "Гибрид",
        electric: "Электро",
      },
    },
  };
  return packs[locale] ?? packs.tr;
}

function resolveLocale(explicit?: LocaleCode): LocaleCode {
  if (explicit) return explicit;
  if (typeof document !== "undefined") {
    const lang = document.documentElement.lang;
    if (lang === "tr" || lang === "en" || lang === "ru") return lang;
  }
  return "tr";
}

async function loadBinaryString(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let result = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    result += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return result;
}

async function loadDataUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function money(amount: number, currency: string) {
  return `${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatDateTime(value: string, locale: LocaleCode) {
  return new Date(value).toLocaleString(
    locale === "tr" ? "tr-TR" : locale === "ru" ? "ru-RU" : "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function locationLabel(
  id: string,
  locations: Location[] | undefined,
  locale: LocaleCode,
) {
  const found = locations?.find((item) => item.id === id);
  if (!found) return id || "—";
  return `${localize(found.name, locale)} · ${found.city}`;
}

export async function downloadBookingPdf(
  booking: Booking,
  options: BookingPdfOptions = {},
) {
  const locale = resolveLocale(options.locale);
  const copy = getCopy(locale);
  const vehicle = options.vehicle ?? null;

  const [regularFont, boldFont, logoDataUrl] = await Promise.all([
    loadBinaryString("/fonts/NotoSans-Regular.ttf"),
    loadBinaryString("/fonts/NotoSans-Bold.ttf"),
    loadDataUrl(BRAND.logo),
  ]);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  pdf.addFileToVFS("NotoSans-Regular.ttf", regularFont);
  pdf.addFileToVFS("NotoSans-Bold.ttf", boldFont);
  pdf.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  pdf.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
  pdf.setFont("NotoSans", "normal");

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = 0;

  const navy: [number, number, number] = [11, 31, 58];
  const gold: [number, number, number] = [201, 162, 39];
  const slate: [number, number, number] = [71, 85, 105];
  const ink: [number, number, number] = [15, 23, 42];
  const soft: [number, number, number] = [248, 250, 252];
  const line: [number, number, number] = [226, 232, 240];

  const setNormal = (size = 10) => {
    pdf.setFont("NotoSans", "normal");
    pdf.setFontSize(size);
  };
  const setBold = (size = 10) => {
    pdf.setFont("NotoSans", "bold");
    pdf.setFontSize(size);
  };

  const ensureSpace = (needed: number) => {
    if (y + needed < pageH - 18) return;
    pdf.addPage();
    y = margin;
  };

  const drawSectionTitle = (title: string) => {
    ensureSpace(14);
    setBold(11);
    pdf.setTextColor(...navy);
    pdf.text(title, margin, y);
    y += 2;
    pdf.setDrawColor(...gold);
    pdf.setLineWidth(0.6);
    pdf.line(margin, y, margin + 28, y);
    y += 6;
  };

  const drawKV = (label: string, value: string, x = margin, width = contentW) => {
    ensureSpace(8);
    setNormal(9);
    pdf.setTextColor(...slate);
    pdf.text(label, x, y);
    setBold(9.5);
    pdf.setTextColor(...ink);
    const lines = pdf.splitTextToSize(value || "—", width - 42);
    pdf.text(lines, x + 40, y);
    y += Math.max(6.5, lines.length * 4.8);
  };

  const drawRow = (
    label: string,
    value: string,
    emphasize = false,
  ) => {
    ensureSpace(8);
    if (emphasize) {
      pdf.setFillColor(11, 31, 58);
      pdf.roundedRect(margin, y - 4.5, contentW, 9, 1.5, 1.5, "F");
      setBold(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text(label, margin + 3, y + 1);
      pdf.text(value, pageW - margin - 3, y + 1, { align: "right" });
      y += 10;
      return;
    }
    setNormal(9.5);
    pdf.setTextColor(...slate);
    pdf.text(label, margin, y);
    setBold(9.5);
    pdf.setTextColor(...ink);
    pdf.text(value, pageW - margin, y, { align: "right" });
    y += 6.5;
  };

  // Header
  pdf.setFillColor(...navy);
  pdf.rect(0, 0, pageW, 42, "F");
  pdf.setFillColor(...gold);
  pdf.rect(0, 42, pageW, 1.4, "F");

  try {
    pdf.addImage(logoDataUrl, "PNG", margin, 8, 18, 18);
  } catch {
    // logo optional if decode fails
  }

  setBold(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text(BRAND.name, margin + 22, 16);
  setNormal(8.5);
  pdf.setTextColor(203, 213, 225);
  pdf.text(copy.companyLine, margin + 22, 22);
  pdf.text(
    `${BRAND.phone}  ·  ${BRAND.email}`,
    margin + 22,
    28,
  );
  pdf.text(BRAND.domain.replace("https://", ""), margin + 22, 34);

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(pageW - margin - 48, 10, 48, 22, 2, 2, "F");
  setNormal(7.5);
  pdf.setTextColor(...slate);
  const codeLabel =
    locale === "en" ? "BOOKING CODE" : locale === "ru" ? "КОД БРОНИ" : "REZ. KODU";
  pdf.text(codeLabel, pageW - margin - 24, 17, { align: "center" });
  setBold(11);
  pdf.setTextColor(...navy);
  pdf.text(booking.code, pageW - margin - 24, 25, { align: "center" });

  y = 52;

  setBold(18);
  pdf.setTextColor(...navy);
  pdf.text(copy.documentTitle, margin, y);
  y += 8;

  pdf.setFillColor(...soft);
  pdf.roundedRect(margin, y - 4, contentW, 10, 2, 2, "F");
  setNormal(9);
  pdf.setTextColor(...slate);
  pdf.text(`${copy.statusLabel}:`, margin + 3, y + 2);
  setBold(9.5);
  pdf.setTextColor(...navy);
  pdf.text(copy.statuses[booking.status] ?? booking.status, margin + 28, y + 2);
  y += 14;

  // Customer
  drawSectionTitle(copy.customerSection);
  pdf.setFillColor(...soft);
  pdf.roundedRect(margin, y - 3, contentW, 28, 2, 2, "F");
  const customerTop = y + 2;
  y = customerTop;
  drawKV(
    copy.fullName,
    `${booking.customer.firstName} ${booking.customer.lastName}`,
  );
  drawKV(copy.email, booking.customer.email);
  drawKV(copy.phone, booking.customer.phone);
  drawKV(
    copy.license,
    booking.customer.licenseFrontUrl || booking.customer.licenseBackUrl
      ? copy.licenseYes
      : copy.licenseNo,
  );
  y += 4;

  // Vehicle
  drawSectionTitle(copy.vehicleSection);
  const carName = vehicle
    ? `${vehicle.brand} ${vehicle.model}`
    : booking.vehicleId;
  drawKV(copy.vehicle, carName);
  if (vehicle) {
    drawKV(copy.plate, vehicle.plate);
    drawKV(copy.year, String(vehicle.specs.year));
    drawKV(
      copy.transmission,
      copy.transmissions[vehicle.specs.transmission] ??
        vehicle.specs.transmission,
    );
    drawKV(
      copy.fuel,
      copy.fuels[vehicle.specs.fuel] ?? vehicle.specs.fuel,
    );
    drawKV(copy.seats, String(vehicle.specs.seats));
  }
  y += 2;

  // Rental
  drawSectionTitle(copy.rentalSection);
  drawKV(
    copy.pickup,
    `${locationLabel(booking.pickupLocationId, options.locations, locale)}\n${formatDateTime(booking.pickupAt, locale)}`,
  );
  y += 1;
  drawKV(
    copy.dropoff,
    `${locationLabel(booking.dropoffLocationId, options.locations, locale)}\n${formatDateTime(booking.returnAt, locale)}`,
  );
  y += 1;
  drawKV(copy.duration, `${booking.days} ${copy.day}`);
  y += 2;

  // Add-ons
  drawSectionTitle(copy.addOnsSection);
  if (!booking.addOns.length) {
    setNormal(9.5);
    pdf.setTextColor(...slate);
    pdf.text(copy.noAddOns, margin, y);
    y += 8;
  } else {
    booking.addOns.forEach((item) => {
      const catalog = options.addOns?.find((a) => a.id === item.addOnId);
      const name = catalog
        ? localize(catalog.name, locale)
        : item.addOnId;
      drawRow(
        `${name} × ${item.quantity}`,
        money(item.unitPrice * item.quantity * booking.days, booking.currency),
      );
    });
    y += 2;
  }

  // Pricing
  drawSectionTitle(copy.pricingSection);
  pdf.setDrawColor(...line);
  pdf.setLineWidth(0.2);
  pdf.line(margin, y - 2, pageW - margin, y - 2);
  drawRow(
    `${copy.dailyRate} (${money(booking.dailyRate, booking.currency)} × ${booking.days})`,
    money(booking.subtotal, booking.currency),
  );
  if (booking.discount > 0) {
    drawRow(copy.discount, `- ${money(booking.discount, booking.currency)}`);
  }
  drawRow(copy.extras, money(booking.extrasTotal, booking.currency));
  drawRow(copy.insurance, money(booking.insuranceTotal, booking.currency));
  drawRow(copy.tax, money(booking.tax, booking.currency));
  y += 1;
  drawRow(copy.total, money(booking.total, booking.currency), true);
  y += 4;

  // Payment
  drawSectionTitle(copy.paymentSection);
  drawKV(copy.method, copy.paymentMethods[booking.paymentMethod]);
  drawKV(copy.paymentStatus, copy.paymentStatuses[booking.paymentStatus]);
  y += 2;

  // Notes
  drawSectionTitle(copy.notesSection);
  setNormal(9.5);
  pdf.setTextColor(...ink);
  const notes = booking.notes?.trim() || copy.noNotes;
  const noteLines = pdf.splitTextToSize(notes, contentW);
  ensureSpace(noteLines.length * 5 + 8);
  pdf.text(noteLines, margin, y);
  y += noteLines.length * 5 + 6;

  // Pending note box
  ensureSpace(24);
  pdf.setFillColor(255, 251, 235);
  pdf.setDrawColor(...gold);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(margin, y, contentW, 16, 2, 2, "FD");
  setNormal(8.5);
  pdf.setTextColor(...navy);
  const pendingLines = pdf.splitTextToSize(copy.pendingNote, contentW - 8);
  pdf.text(pendingLines, margin + 4, y + 6);
  y += 22;

  // Footer
  ensureSpace(20);
  pdf.setDrawColor(...line);
  pdf.line(margin, y, pageW - margin, y);
  y += 6;
  setBold(10);
  pdf.setTextColor(...navy);
  pdf.text(copy.thanks, margin, y);
  y += 6;
  setNormal(8);
  pdf.setTextColor(...slate);
  pdf.text(
    `${copy.generatedAt}: ${formatDateTime(new Date().toISOString(), locale)}`,
    margin,
    y,
  );
  pdf.text(
    `${BRAND.whatsapp} · ${BRAND.email}`,
    pageW - margin,
    y,
    { align: "right" },
  );

  // Page footer strip
  pdf.setFillColor(...navy);
  pdf.rect(0, pageH - 8, pageW, 8, "F");
  setNormal(7);
  pdf.setTextColor(226, 232, 240);
  pdf.text(
    `${BRAND.name} · ${BRAND.domain.replace("https://", "")}`,
    pageW / 2,
    pageH - 3,
    { align: "center" },
  );

  pdf.save(`${booking.code}.pdf`);
}
