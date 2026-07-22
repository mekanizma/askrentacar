import { describe, expect, it } from "vitest";
import { createSeedDatabase } from "../src/mock/seed";
import { daysBetween } from "../src/utils/format";
import { mockBookingRepository } from "../src/repositories/mock/bookings";
import { resetDatabase } from "../src/repositories/mock/db";

describe("seed database", () => {
  it("creates expected volume of mock records", () => {
    const db = createSeedDatabase();
    expect(db.vehicles).toHaveLength(120);
    expect(db.users).toHaveLength(50);
    expect(db.bookings).toHaveLength(250);
    expect(db.blogPosts).toHaveLength(40);
    expect(db.campaigns).toHaveLength(15);
    expect(db.reviews).toHaveLength(20);
    expect(db.categories).toHaveLength(10);
    expect(db.locations).toHaveLength(9);
  });
});

describe("pricing helpers", () => {
  it("computes inclusive rental days", () => {
    expect(daysBetween("2026-07-01", "2026-07-04")).toBe(3);
  });
});

describe("booking repository", () => {
  it("quotes a vehicle with add-ons and campaign", async () => {
    resetDatabase();
    const db = createSeedDatabase();
    const vehicle = db.vehicles[0]!;
    const quote = await mockBookingRepository.quote({
      vehicleId: vehicle.id,
      pickupAt: "2026-08-10T10:00:00.000Z",
      returnAt: "2026-08-13T10:00:00.000Z",
      addOnIds: ["addon_001"],
      campaignCode: "SUMMER10",
    });
    expect(quote.days).toBe(3);
    expect(quote.total).toBeGreaterThan(0);
    expect(quote.extrasTotal).toBeGreaterThan(0);
  });
});
