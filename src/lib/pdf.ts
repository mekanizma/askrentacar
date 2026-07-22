import { jsPDF } from "jspdf";
import type { Booking, Vehicle } from "@/types";

export function downloadBookingPdf(booking: Booking, vehicle?: Vehicle | null) {
  const pdf = new jsPDF();
  const car = vehicle ? `${vehicle.brand} ${vehicle.model}` : booking.vehicleId;
  const locale =
    typeof document !== "undefined" && ["tr", "en", "ru"].includes(document.documentElement.lang)
      ? document.documentElement.lang
      : "tr";
  const copy = {
    tr: {
      title: "Rezervasyon Onayı",
      code: "Rezervasyon kodu",
      customer: "Müşteri",
      vehicle: "Araç",
      pickup: "Alış",
      return: "İade",
      duration: "Süre",
      day: "gün",
      total: "Toplam",
      payment: "Ödeme",
      thanks: "ASK RENT A CAR'ı tercih ettiğiniz için teşekkür ederiz.",
    },
    en: {
      title: "Booking Confirmation",
      code: "Booking code",
      customer: "Customer",
      vehicle: "Vehicle",
      pickup: "Pickup",
      return: "Return",
      duration: "Duration",
      day: "day(s)",
      total: "Total",
      payment: "Payment",
      thanks: "Thank you for choosing ASK RENT A CAR.",
    },
    ru: {
      title: "Подтверждение бронирования",
      code: "Код бронирования",
      customer: "Клиент",
      vehicle: "Автомобиль",
      pickup: "Получение",
      return: "Возврат",
      duration: "Срок",
      day: "дн.",
      total: "Итого",
      payment: "Оплата",
      thanks: "Спасибо, что выбрали ASK RENT A CAR.",
    },
  }[locale as "tr" | "en" | "ru"];
  const paymentMethods = {
    tr: { card: "Kart", cash: "Nakit", transfer: "Banka havalesi" },
    en: { card: "Card", cash: "Cash", transfer: "Bank transfer" },
    ru: { card: "Карта", cash: "Наличные", transfer: "Банковский перевод" },
  }[locale as "tr" | "en" | "ru"];
  const paymentStatuses = {
    tr: { pending: "Bekliyor", paid: "Ödendi", refunded: "İade edildi" },
    en: { pending: "Pending", paid: "Paid", refunded: "Refunded" },
    ru: { pending: "Ожидается", paid: "Оплачено", refunded: "Возвращено" },
  }[locale as "tr" | "en" | "ru"];
  pdf.setFontSize(20);
  pdf.text("ASK RENT A CAR", 20, 24);
  pdf.setFontSize(14);
  pdf.text(copy.title, 20, 36);
  pdf.setFontSize(11);
  [
    `${copy.code}: ${booking.code}`,
    `${copy.customer}: ${booking.customer.firstName} ${booking.customer.lastName}`,
    `${copy.vehicle}: ${car}`,
    `${copy.pickup}: ${new Date(booking.pickupAt).toLocaleString(locale)}`,
    `${copy.return}: ${new Date(booking.returnAt).toLocaleString(locale)}`,
    `${copy.duration}: ${booking.days} ${copy.day}`,
    `${copy.total}: ${booking.total.toFixed(2)} ${booking.currency}`,
    `${copy.payment}: ${paymentMethods[booking.paymentMethod]} (${paymentStatuses[booking.paymentStatus]})`,
  ].forEach((line, index) => pdf.text(line, 20, 52 + index * 9));
  pdf.text(copy.thanks, 20, 134);
  pdf.save(`${booking.code}.pdf`);
}
