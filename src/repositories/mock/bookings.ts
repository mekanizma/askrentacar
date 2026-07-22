import type { Booking, PriceQuote } from "@/types";
import type { BookingRepository } from "@/repositories/contracts";
import {
  getDatabase,
  paginate,
  persistDatabase,
  withLatency,
} from "@/repositories/mock/db";
import { daysBetween } from "@/utils/format";

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return new Date(aStart) < new Date(bEnd) && new Date(aEnd) > new Date(bStart);
}

export const mockBookingRepository: BookingRepository = {
  async list(filters = {}) {
    const db = getDatabase();
    let items = [...db.bookings];
    if (filters.q) {
      const q = filters.q.toLowerCase();
      items = items.filter(
        (b) =>
          b.code.toLowerCase().includes(q) ||
          b.customer.email.toLowerCase().includes(q) ||
          b.customer.firstName.toLowerCase().includes(q),
      );
    }
    if (filters.status)
      items = items.filter((b) => b.status === filters.status);
    if (filters.userId)
      items = items.filter((b) => b.userId === filters.userId);
    if (filters.vehicleId)
      items = items.filter((b) => b.vehicleId === filters.vehicleId);
    if (filters.from)
      items = items.filter(
        (b) => new Date(b.pickupAt) >= new Date(filters.from!),
      );
    if (filters.to)
      items = items.filter(
        (b) => new Date(b.returnAt) <= new Date(filters.to!),
      );
    items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return withLatency(paginate(items, filters.page, filters.pageSize ?? 20));
  },

  async getById(id) {
    return withLatency(getDatabase().bookings.find((b) => b.id === id) ?? null);
  },

  async getByCode(code) {
    return withLatency(
      getDatabase().bookings.find((b) => b.code === code) ?? null,
    );
  },

  async quote(input) {
    const db = getDatabase();
    const vehicle = db.vehicles.find((v) => v.id === input.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    const days = daysBetween(input.pickupAt, input.returnAt);
    const dailyRate = vehicle.pricing.daily;
    const subtotal = dailyRate * days;
    let discount = vehicle.pricing.discountPercent
      ? Math.round((subtotal * vehicle.pricing.discountPercent) / 100)
      : 0;

    if (input.campaignCode) {
      const campaign = db.campaigns.find(
        (c) =>
          c.code.toLowerCase() === input.campaignCode!.toLowerCase() &&
          c.active,
      );
      if (campaign) {
        discount += Math.round((subtotal * campaign.discountPercent) / 100);
      }
    }

    const addOns = db.addOns.filter((a) => input.addOnIds?.includes(a.id));
    const vehicleCurrencyRate =
      db.settings.exchangeRates[vehicle.pricing.currency] || 1;
    const extrasTotal = addOns.reduce(
      (sum, a) => sum + a.priceDaily * vehicleCurrencyRate * days,
      0,
    );
    const insuranceTotal = vehicle.pricing.insuranceDaily * days;
    const taxedBase = subtotal - discount + extrasTotal + insuranceTotal;
    const tax = Math.round(taxedBase * 0.05);
    const quote: PriceQuote = {
      vehicleId: vehicle.id,
      days,
      dailyRate,
      subtotal,
      discount,
      extrasTotal,
      insuranceTotal,
      tax,
      total: taxedBase + tax,
      currency: vehicle.pricing.currency,
    };
    return withLatency(quote, 120);
  },

  async create(input) {
    const db = getDatabase();
    const vehicle = db.vehicles.find((item) => item.id === input.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");
    const manuallyBlocked = (vehicle.blockedPeriods ?? []).some((period) =>
      overlaps(input.pickupAt, input.returnAt, period.start, period.end),
    );
    if (manuallyBlocked) {
      throw new Error("Selected vehicle is blocked for these dates");
    }
    const conflict = db.bookings.some(
      (b) =>
        b.vehicleId === input.vehicleId &&
        b.status !== "cancelled" &&
        overlaps(input.pickupAt, input.returnAt, b.pickupAt, b.returnAt),
    );
    if (conflict)
      throw new Error("Selected vehicle is not available for these dates");

    const now = new Date().toISOString();
    const booking: Booking = {
      ...input,
      id: `bkg_${Date.now()}`,
      code: `CPD-2026-${String(db.bookings.length + 1).padStart(4, "0")}`,
      createdAt: now,
      updatedAt: now,
    };
    db.bookings.unshift(booking);
    persistDatabase();
    return withLatency(booking);
  },

  async update(id, patch) {
    const db = getDatabase();
    const idx = db.bookings.findIndex((b) => b.id === id);
    if (idx < 0) throw new Error("Booking not found");
    db.bookings[idx] = {
      ...db.bookings[idx]!,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    persistDatabase();
    return withLatency(db.bookings[idx]!);
  },

  async remove(id) {
    const db = getDatabase();
    db.bookings = db.bookings.filter((b) => b.id !== id);
    persistDatabase();
    await withLatency(undefined);
  },
};
