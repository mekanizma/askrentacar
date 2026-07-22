import type { Booking, PriceQuote } from "@/types";
import type { BookingRepository } from "@/repositories/contracts";
import { getSupabase } from "@/lib/supabase/client";
import { daysBetween } from "@/utils/format";
import { mapBooking, paginate } from "@/repositories/supabase/mappers";
import { supabaseVehicleRepository } from "@/repositories/supabase/vehicles";

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return new Date(aStart) < new Date(bEnd) && new Date(aEnd) > new Date(bStart);
}

async function loadBookingAddOns(bookingIds: string[]) {
  const map = new Map<string, Booking["addOns"]>();
  if (!bookingIds.length) return map;
  const { data } = await getSupabase()
    .from("booking_add_ons")
    .select("*")
    .in("booking_id", bookingIds);
  for (const row of data ?? []) {
    const list = map.get(row.booking_id) ?? [];
    list.push({
      addOnId: row.add_on_id,
      quantity: row.quantity,
      unitPrice: Number(row.unit_price),
    });
    map.set(row.booking_id, list);
  }
  return map;
}

async function hydrateBookings(rows: Record<string, unknown>[]): Promise<Booking[]> {
  const addOns = await loadBookingAddOns(rows.map((r) => String(r.id)));
  return rows.map((row) => mapBooking(row, addOns.get(String(row.id)) ?? []));
}

export const supabaseBookingRepository: BookingRepository = {
  async list(filters = {}) {
    const sb = getSupabase();
    let query = sb.from("bookings").select("*").order("created_at", { ascending: false });
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.userId && filters.userId !== "guest") {
      query = query.eq("user_id", filters.userId);
    }
    if (filters.vehicleId) query = query.eq("vehicle_id", filters.vehicleId);
    if (filters.from) query = query.gte("pickup_at", filters.from);
    if (filters.to) query = query.lte("return_at", filters.to);

    const { data, error } = await query;
    if (error) throw error;
    let items = await hydrateBookings((data ?? []) as Record<string, unknown>[]);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      items = items.filter(
        (b) =>
          b.code.toLowerCase().includes(q) ||
          b.customer.email.toLowerCase().includes(q) ||
          b.customer.firstName.toLowerCase().includes(q),
      );
    }
    return paginate(items, filters.page, filters.pageSize ?? 20);
  },

  async getById(id) {
    const { data, error } = await getSupabase()
      .from("bookings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const [booking] = await hydrateBookings([data as Record<string, unknown>]);
    return booking ?? null;
  },

  async getByCode(code) {
    const { data, error } = await getSupabase()
      .from("bookings")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const [booking] = await hydrateBookings([data as Record<string, unknown>]);
    return booking ?? null;
  },

  async quote(input) {
    const vehicle = await supabaseVehicleRepository.getById(input.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");
    const days = daysBetween(input.pickupAt, input.returnAt);
    const dailyRate = vehicle.pricing.daily;
    const subtotal = dailyRate * days;
    let discount = vehicle.pricing.discountPercent
      ? Math.round((subtotal * vehicle.pricing.discountPercent) / 100)
      : 0;

    if (input.campaignCode) {
      const { data: campaign } = await getSupabase()
        .from("campaigns")
        .select("*")
        .ilike("code", input.campaignCode)
        .eq("active", true)
        .maybeSingle();
      if (campaign) {
        discount += Math.round((subtotal * Number(campaign.discount_percent)) / 100);
      }
    }

    const { data: addOnRows } = await getSupabase()
      .from("add_ons")
      .select("*")
      .in("id", input.addOnIds ?? []);
    const extrasTotal = (addOnRows ?? []).reduce(
      (sum, a) => sum + Number(a.price_daily) * days,
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
    return quote;
  },

  async create(input) {
    const sb = getSupabase();
    const vehicle = await supabaseVehicleRepository.getById(input.vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");

    const manuallyBlocked = (vehicle.blockedPeriods ?? []).some((period) =>
      overlaps(input.pickupAt, input.returnAt, period.start, period.end),
    );
    if (manuallyBlocked) {
      throw new Error("Selected vehicle is blocked for these dates");
    }

    const { data: existing } = await sb
      .from("bookings")
      .select("pickup_at, return_at, status")
      .eq("vehicle_id", input.vehicleId)
      .neq("status", "cancelled");
    const conflict = (existing ?? []).some((b) =>
      overlaps(input.pickupAt, input.returnAt, b.pickup_at, b.return_at),
    );
    if (conflict) throw new Error("Selected vehicle is not available for these dates");

    const userId =
      !input.userId || input.userId === "guest" ? null : input.userId;

    const { data, error } = await sb
      .from("bookings")
      .insert({
        user_id: userId,
        vehicle_id: input.vehicleId,
        status: input.status,
        pickup_location_id: input.pickupLocationId || null,
        dropoff_location_id: input.dropoffLocationId || null,
        pickup_at: input.pickupAt,
        return_at: input.returnAt,
        daily_rate: input.dailyRate,
        days: input.days,
        subtotal: input.subtotal,
        discount: input.discount,
        extras_total: input.extrasTotal,
        insurance_total: input.insuranceTotal,
        tax: input.tax,
        total: input.total,
        currency: input.currency,
        customer_first_name: input.customer.firstName,
        customer_last_name: input.customer.lastName,
        customer_email: input.customer.email,
        customer_phone: input.customer.phone,
        license_front_url: input.customer.licenseFrontUrl ?? null,
        license_back_url: input.customer.licenseBackUrl ?? null,
        license_front_name: input.customer.licenseFrontName ?? null,
        license_back_name: input.customer.licenseBackName ?? null,
        payment_method: input.paymentMethod,
        payment_status: input.paymentStatus,
        notes: input.notes ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;

    if (input.addOns?.length) {
      const { error: addOnError } = await sb.from("booking_add_ons").insert(
        input.addOns.map((item) => ({
          booking_id: data.id,
          add_on_id: item.addOnId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      );
      if (addOnError) throw addOnError;
    }

    const created = await this.getById(data.id);
    if (!created) throw new Error("Booking create failed");
    return created;
  },

  async update(id, patch) {
    const sb = getSupabase();
    const payload: Record<string, unknown> = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.paymentStatus !== undefined) payload.payment_status = patch.paymentStatus;
    if (patch.paymentMethod !== undefined) payload.payment_method = patch.paymentMethod;
    if (patch.notes !== undefined) payload.notes = patch.notes;
    if (patch.customer) {
      payload.customer_first_name = patch.customer.firstName;
      payload.customer_last_name = patch.customer.lastName;
      payload.customer_email = patch.customer.email;
      payload.customer_phone = patch.customer.phone;
      payload.license_front_url = patch.customer.licenseFrontUrl ?? null;
      payload.license_back_url = patch.customer.licenseBackUrl ?? null;
      payload.license_front_name = patch.customer.licenseFrontName ?? null;
      payload.license_back_name = patch.customer.licenseBackName ?? null;
    }
    const { error } = await sb.from("bookings").update(payload).eq("id", id);
    if (error) throw error;
    const updated = await this.getById(id);
    if (!updated) throw new Error("Booking not found");
    return updated;
  },

  async remove(id) {
    const { error } = await getSupabase().from("bookings").delete().eq("id", id);
    if (error) throw error;
  },
};
