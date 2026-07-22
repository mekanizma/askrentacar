import type { BlogPost, Campaign, DashboardStats } from "@/types";
import type { ContentRepository } from "@/repositories/contracts";
import { getDatabase, persistDatabase, withLatency } from "@/repositories/mock/db";

export const mockContentRepository: ContentRepository = {
  async categories() {
    return withLatency(getDatabase().categories);
  },
  async locations() {
    return withLatency(getDatabase().locations);
  },
  async addOns() {
    return withLatency(getDatabase().addOns);
  },
  async reviews(vehicleId) {
    const items = getDatabase().reviews.filter((r) =>
      vehicleId ? r.vehicleId === vehicleId : true,
    );
    return withLatency(items);
  },
  async blogPosts(q) {
    let posts = getDatabase().blogPosts;
    if (q) {
      const query = q.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.tr.toLowerCase().includes(query) ||
          p.title.en.toLowerCase().includes(query) ||
          p.tags.some((t) => t.includes(query)),
      );
    }
    return withLatency(posts);
  },
  async blogBySlug(slug) {
    return withLatency(getDatabase().blogPosts.find((p) => p.slug === slug) ?? null);
  },
  async saveBlog(post) {
    const db = getDatabase();
    const idx = db.blogPosts.findIndex((p) => p.id === post.id);
    if (idx >= 0) db.blogPosts[idx] = post;
    else db.blogPosts.unshift(post);
    persistDatabase();
    return withLatency(post);
  },
  async removeBlog(id) {
    const db = getDatabase();
    db.blogPosts = db.blogPosts.filter((p) => p.id !== id);
    persistDatabase();
    await withLatency(undefined);
  },
  async campaigns() {
    return withLatency(getDatabase().campaigns);
  },
  async saveCampaign(campaign) {
    const db = getDatabase();
    const idx = db.campaigns.findIndex((c) => c.id === campaign.id);
    if (idx >= 0) db.campaigns[idx] = campaign;
    else db.campaigns.unshift(campaign);
    persistDatabase();
    return withLatency(campaign);
  },
  async removeCampaign(id) {
    const db = getDatabase();
    db.campaigns = db.campaigns.filter((c) => c.id !== id);
    persistDatabase();
    await withLatency(undefined);
  },
  async media() {
    return withLatency(getDatabase().media);
  },
  async settings() {
    return withLatency(getDatabase().settings);
  },
  async updateSettings(patch) {
    const db = getDatabase();
    db.settings = { ...db.settings, ...patch };
    persistDatabase();
    return withLatency(db.settings);
  },
  async notifications(userId) {
    return withLatency(getDatabase().notifications.filter((n) => n.userId === userId));
  },
  async markNotificationRead(id) {
    const db = getDatabase();
    const item = db.notifications.find((n) => n.id === id);
    if (item) item.read = true;
    persistDatabase();
    await withLatency(undefined);
  },
  async invoices(userId) {
    const items = getDatabase().invoices.filter((i) => (userId ? i.userId === userId : true));
    return withLatency(items);
  },
  async dashboardStats() {
    const db = getDatabase();
    const today = new Date().toISOString().slice(0, 10);
    const stats: DashboardStats = {
      totalVehicles: db.vehicles.length,
      availableVehicles: db.vehicles.filter((v) => v.status === "available").length,
      totalBookings: db.bookings.length,
      pendingBookings: db.bookings.filter((b) => b.status === "pending").length,
      revenue: db.bookings
        .filter((b) => b.paymentStatus === "paid")
        .reduce((sum, b) => sum + b.total, 0),
      todayPickups: db.bookings.filter((b) => b.pickupAt.startsWith(today)).length,
      todayReturns: db.bookings.filter((b) => b.returnAt.startsWith(today)).length,
      customers: db.users.filter((u) => u.role === "customer").length,
      occupancyRate: Math.round(
        (db.vehicles.filter((v) => v.status === "rented").length / db.vehicles.length) * 100,
      ),
    };
    return withLatency(stats);
  },
  async contact() {
    return withLatency({ ok: true as const }, 400);
  },
};

// Keep unused type imports referenced for future admin CRUD helpers
export type ContentMutations = BlogPost | Campaign;
