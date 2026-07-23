import type { Vehicle, VehicleFilters } from "@/types";
import type { VehicleRepository } from "@/repositories/contracts";
import { getSupabase } from "@/lib/supabase/client";
import {
  mapMedia,
  mapVehicle,
  paginate,
  vehicleToRow,
} from "@/repositories/supabase/mappers";

async function loadVehicleExtras(vehicleIds: string[]) {
  const sb = getSupabase();
  if (vehicleIds.length === 0) {
    return { images: new Map(), blocked: new Map() };
  }
  const [{ data: images }, { data: blocked }] = await Promise.all([
    sb
      .from("vehicle_images")
      .select("*")
      .in("vehicle_id", vehicleIds)
      .order("sort_order"),
    sb.from("vehicle_blocked_periods").select("*").in("vehicle_id", vehicleIds),
  ]);

  const imageMap = new Map<string, ReturnType<typeof mapMedia>[]>();
  for (const row of images ?? []) {
    const list = imageMap.get(row.vehicle_id) ?? [];
    list.push(
      mapMedia({
        ...row,
        sort_order: row.sort_order,
      }),
    );
    imageMap.set(row.vehicle_id, list);
  }

  const blockedMap = new Map<
    string,
    NonNullable<Vehicle["blockedPeriods"]>
  >();
  for (const row of blocked ?? []) {
    const list = blockedMap.get(row.vehicle_id) ?? [];
    list.push({
      id: row.id,
      start: row.start_at,
      end: row.end_at,
      reason: row.reason ?? "",
    });
    blockedMap.set(row.vehicle_id, list);
  }
  return { images: imageMap, blocked: blockedMap };
}

async function hydrateVehicles(rows: Record<string, unknown>[]): Promise<Vehicle[]> {
  const ids = rows.map((r) => String(r.id));
  const { images, blocked } = await loadVehicleExtras(ids);
  return rows.map((row) =>
    mapVehicle(
      row,
      images.get(String(row.id)) ?? [],
      blocked.get(String(row.id)) ?? [],
    ),
  );
}

function applyClientFilters(items: Vehicle[], filters: VehicleFilters = {}) {
  let result = [...items];
  const rates = { EUR: 1, GBP: 0.86, TRY: 36.5 };
  const dailyPriceInEur = (vehicle: Vehicle) =>
    vehicle.pricing.daily / (rates[vehicle.pricing.currency] || 1);

  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter(
      (v) =>
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q),
    );
  }
  if (filters.categoryId)
    result = result.filter((v) => v.categoryId === filters.categoryId);
  if (filters.fuel) result = result.filter((v) => v.specs.fuel === filters.fuel);
  if (filters.transmission) {
    result = result.filter((v) => v.specs.transmission === filters.transmission);
  }
  if (filters.seatsMin)
    result = result.filter((v) => v.specs.seats >= filters.seatsMin!);
  if (filters.priceMin)
    result = result.filter((v) => dailyPriceInEur(v) >= filters.priceMin!);
  if (filters.priceMax)
    result = result.filter((v) => dailyPriceInEur(v) <= filters.priceMax!);
  if (filters.status) result = result.filter((v) => v.status === filters.status);
  if (filters.featured) result = result.filter((v) => v.featured);

  switch (filters.sort) {
    case "price_asc":
      result.sort((a, b) => dailyPriceInEur(a) - dailyPriceInEur(b));
      break;
    case "price_desc":
      result.sort((a, b) => dailyPriceInEur(b) - dailyPriceInEur(a));
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      result.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      break;
    case "popular":
    default:
      result.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
  }
  return result;
}

async function syncVehicleImages(vehicleId: string, images: Vehicle["images"]) {
  const sb = getSupabase();
  await sb.from("vehicle_images").delete().eq("vehicle_id", vehicleId);
  if (!images?.length) return;
  const rows = images.map((img, index) => ({
    vehicle_id: vehicleId,
    url: img.url,
    alt: img.alt,
    type: img.type,
    sort_order: img.order ?? index,
  }));
  const { error } = await sb.from("vehicle_images").insert(rows);
  if (error) throw error;
}

async function getVehicleById(id: string) {
  const sb = getSupabase();
  const { data, error } = await sb.from("vehicles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [vehicle] = await hydrateVehicles([data as Record<string, unknown>]);
  return vehicle ?? null;
}

export const supabaseVehicleRepository: VehicleRepository = {
  async list(filters = {}) {
    const sb = getSupabase();
    let query = sb.from("vehicles").select("*");

    if (filters.categorySlug) {
      const { data: cat } = await sb
        .from("categories")
        .select("id")
        .eq("slug", filters.categorySlug)
        .maybeSingle();
      if (cat) query = query.eq("category_id", cat.id);
    }
    if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.featured) query = query.eq("featured", true);

    const { data, error } = await query;
    if (error) throw error;
    let vehicles = await hydrateVehicles((data ?? []) as Record<string, unknown>[]);

    if (filters.pickupAt && filters.returnAt) {
      const start = filters.pickupAt;
      const end = filters.returnAt;
      const { data: busyRows, error: busyError } = await sb.rpc(
        "get_busy_vehicle_ids",
        { p_start: start, p_end: end },
      );
      if (busyError) throw busyError;
      const booked = new Set(
        ((busyRows ?? []) as { vehicle_id: string }[]).map((row) => row.vehicle_id),
      );
      vehicles = vehicles.filter((v) => {
        const manuallyBlocked = (v.blockedPeriods ?? []).some(
          (period) => start < period.end && end > period.start,
        );
        return v.status === "available" && !booked.has(v.id) && !manuallyBlocked;
      });
    }

    vehicles = applyClientFilters(vehicles, filters);
    return paginate(vehicles, filters.page, filters.pageSize ?? 12);
  },

  async getById(id) {
    return getVehicleById(id);
  },

  async getBySlug(slug) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("vehicles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const [vehicle] = await hydrateVehicles([data as Record<string, unknown>]);
    return vehicle ?? null;
  },

  async create(input) {
    const sb = getSupabase();
    const row = vehicleToRow(input);
    const { data, error } = await sb.from("vehicles").insert(row).select("*").single();
    if (error) throw error;
    await syncVehicleImages(data.id, input.images ?? []);
    if (input.blockedPeriods?.length) {
      const { error: blockedError } = await sb.from("vehicle_blocked_periods").insert(
        input.blockedPeriods.map((p) => ({
          vehicle_id: data.id,
          start_at: p.start,
          end_at: p.end,
          reason: p.reason,
        })),
      );
      if (blockedError) throw blockedError;
    }
    const created = await getVehicleById(data.id);
    if (!created) throw new Error("Vehicle create failed");
    return created;
  },

  async update(id, patch) {
    const sb = getSupabase();
    const row = vehicleToRow(patch);
    const cleaned = Object.fromEntries(
      Object.entries(row).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(cleaned).length) {
      const { error } = await sb.from("vehicles").update(cleaned).eq("id", id);
      if (error) throw error;
    }
    if (patch.images) await syncVehicleImages(id, patch.images);
    if (patch.blockedPeriods) {
      await sb.from("vehicle_blocked_periods").delete().eq("vehicle_id", id);
      if (patch.blockedPeriods.length) {
        const { error: blockedError } = await sb.from("vehicle_blocked_periods").insert(
          patch.blockedPeriods.map((p) => ({
            vehicle_id: id,
            start_at: p.start,
            end_at: p.end,
            reason: p.reason,
          })),
        );
        if (blockedError) throw blockedError;
      }
    }
    const updated = await getVehicleById(id);
    if (!updated) throw new Error("Vehicle not found");
    return updated;
  },

  async remove(id) {
    const sb = getSupabase();
    const { error } = await sb.from("vehicles").delete().eq("id", id);
    if (error) throw error;
  },

  async similar(vehicleId, limit = 4) {
    const current = await getVehicleById(vehicleId);
    if (!current) return [];
    const { data } = await getSupabase()
      .from("vehicles")
      .select("*")
      .eq("category_id", current.categoryId)
      .neq("id", vehicleId)
      .limit(limit);
    return hydrateVehicles((data ?? []) as Record<string, unknown>[]);
  },
};
