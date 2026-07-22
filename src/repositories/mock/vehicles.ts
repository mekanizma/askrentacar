import type { Vehicle, VehicleFilters } from "@/types";
import type { VehicleRepository } from "@/repositories/contracts";
import {
  getDatabase,
  paginate,
  persistDatabase,
  withLatency,
} from "@/repositories/mock/db";

function applyFilters(items: Vehicle[], filters: VehicleFilters = {}) {
  let result = [...items];
  const rates = getDatabase().settings.exchangeRates;
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
  if (filters.categorySlug) {
    const cat = getDatabase().categories.find(
      (c) => c.slug === filters.categorySlug,
    );
    if (cat) result = result.filter((v) => v.categoryId === cat.id);
  }
  if (filters.fuel)
    result = result.filter((v) => v.specs.fuel === filters.fuel);
  if (filters.transmission) {
    result = result.filter(
      (v) => v.specs.transmission === filters.transmission,
    );
  }
  if (filters.seatsMin)
    result = result.filter((v) => v.specs.seats >= filters.seatsMin!);
  if (filters.priceMin)
    result = result.filter((v) => dailyPriceInEur(v) >= filters.priceMin!);
  if (filters.priceMax)
    result = result.filter((v) => dailyPriceInEur(v) <= filters.priceMax!);
  if (filters.status)
    result = result.filter((v) => v.status === filters.status);
  if (filters.featured) result = result.filter((v) => v.featured);

  if (filters.pickupAt && filters.returnAt) {
    const start = new Date(filters.pickupAt).getTime();
    const end = new Date(filters.returnAt).getTime();
    const bookedIds = new Set(
      getDatabase()
        .bookings.filter((b) => {
          if (["cancelled"].includes(b.status)) return false;
          const bStart = new Date(b.pickupAt).getTime();
          const bEnd = new Date(b.returnAt).getTime();
          return start < bEnd && end > bStart;
        })
        .map((b) => b.vehicleId),
    );
    result = result.filter((v) => {
      const manuallyBlocked = (v.blockedPeriods ?? []).some((period) => {
        const blockedStart = new Date(period.start).getTime();
        const blockedEnd = new Date(period.end).getTime();
        return start < blockedEnd && end > blockedStart;
      });
      return (
        v.status === "available" && !bookedIds.has(v.id) && !manuallyBlocked
      );
    });
  }

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

export const mockVehicleRepository: VehicleRepository = {
  async list(filters) {
    const db = getDatabase();
    const filtered = applyFilters(db.vehicles, filters);
    return withLatency(paginate(filtered, filters?.page, filters?.pageSize));
  },
  async getById(id) {
    return withLatency(getDatabase().vehicles.find((v) => v.id === id) ?? null);
  },
  async getBySlug(slug) {
    return withLatency(
      getDatabase().vehicles.find((v) => v.slug === slug) ?? null,
    );
  },
  async create(input) {
    const db = getDatabase();
    const now = new Date().toISOString();
    const vehicle: Vehicle = {
      ...input,
      id: `veh_${String(db.vehicles.length + 1).padStart(3, "0")}_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    db.vehicles.unshift(vehicle);
    persistDatabase();
    return withLatency(vehicle);
  },
  async update(id, patch) {
    const db = getDatabase();
    const idx = db.vehicles.findIndex((v) => v.id === id);
    if (idx < 0) throw new Error("Vehicle not found");
    db.vehicles[idx] = {
      ...db.vehicles[idx]!,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    persistDatabase();
    return withLatency(db.vehicles[idx]!);
  },
  async remove(id) {
    const db = getDatabase();
    db.vehicles = db.vehicles.filter((v) => v.id !== id);
    persistDatabase();
    await withLatency(undefined);
  },
  async similar(vehicleId, limit = 4) {
    const db = getDatabase();
    const current = db.vehicles.find((v) => v.id === vehicleId);
    if (!current) return withLatency([]);
    const items = db.vehicles
      .filter((v) => v.id !== vehicleId && v.categoryId === current.categoryId)
      .slice(0, limit);
    return withLatency(items);
  },
};
