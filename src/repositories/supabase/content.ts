import type { BlogPost, Campaign, DashboardStats, SiteSettings } from "@/types";
import type { ContentRepository } from "@/repositories/contracts";
import { getSupabase } from "@/lib/supabase/client";
import {
  mapAddOn,
  mapBlog,
  mapCampaign,
  mapCategory,
  mapInvoice,
  mapLocation,
  mapMedia,
  mapNotification,
  mapReview,
  mapSettings,
} from "@/repositories/supabase/mappers";

export const supabaseContentRepository: ContentRepository = {
  async categories() {
    const sb = getSupabase();
    const [{ data: cats, error }, { data: vehicles }] = await Promise.all([
      sb.from("categories").select("*").order("sort_order"),
      sb.from("vehicles").select("category_id"),
    ]);
    if (error) throw error;
    const counts = new Map<string, number>();
    for (const v of vehicles ?? []) {
      if (!v.category_id) continue;
      counts.set(v.category_id, (counts.get(v.category_id) ?? 0) + 1);
    }
    return (cats ?? []).map((row) =>
      mapCategory(row as Record<string, unknown>, counts.get(row.id) ?? 0),
    );
  },

  async locations() {
    const { data, error } = await getSupabase()
      .from("locations")
      .select("*")
      .order("city");
    if (error) throw error;
    return (data ?? []).map((row) => mapLocation(row as Record<string, unknown>));
  },

  async addOns() {
    const { data, error } = await getSupabase()
      .from("add_ons")
      .select("*")
      .eq("active", true);
    if (error) throw error;
    return (data ?? []).map((row) => mapAddOn(row as Record<string, unknown>));
  },

  async reviews(vehicleId) {
    let query = getSupabase().from("reviews").select("*").order("created_at", {
      ascending: false,
    });
    if (vehicleId) query = query.eq("vehicle_id", vehicleId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => mapReview(row as Record<string, unknown>));
  },

  async blogPosts(q) {
    const { data, error } = await getSupabase()
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error) throw error;
    let posts = (data ?? []).map((row) => mapBlog(row as Record<string, unknown>));
    if (q) {
      const query = q.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.tr.toLowerCase().includes(query) ||
          p.title.en.toLowerCase().includes(query) ||
          p.tags.some((t) => t.includes(query)),
      );
    }
    return posts;
  },

  async blogBySlug(slug) {
    const { data, error } = await getSupabase()
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapBlog(data as Record<string, unknown>) : null;
  },

  async saveBlog(post) {
    const sb = getSupabase();
    const row = {
      id: post.id.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      )
        ? post.id
        : undefined,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      cover_image: post.coverImage,
      category: post.category,
      tags: post.tags,
      author: post.author,
      published_at: post.publishedAt,
      reading_minutes: post.readingMinutes,
      seo_title: post.seoTitle,
      seo_description: post.seoDescription,
      published: true,
    };
    const { data, error } = await sb
      .from("blog_posts")
      .upsert(row)
      .select("*")
      .single();
    if (error) throw error;
    return mapBlog(data as Record<string, unknown>);
  },

  async removeBlog(id) {
    const { error } = await getSupabase().from("blog_posts").delete().eq("id", id);
    if (error) throw error;
  },

  async campaigns() {
    const sb = getSupabase();
    const { data, error } = await sb.from("campaigns").select("*").order("starts_at", {
      ascending: false,
    });
    if (error) throw error;
    const { data: links } = await sb.from("campaign_categories").select("*");
    const byCampaign = new Map<string, string[]>();
    for (const link of links ?? []) {
      const list = byCampaign.get(link.campaign_id) ?? [];
      list.push(link.category_id);
      byCampaign.set(link.campaign_id, list);
    }
    return (data ?? []).map((row) =>
      mapCampaign(row as Record<string, unknown>, byCampaign.get(row.id) ?? []),
    );
  },

  async saveCampaign(campaign: Campaign) {
    const sb = getSupabase();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      campaign.id,
    );
    const row = {
      id: isUuid ? campaign.id : undefined,
      slug: campaign.slug,
      title: campaign.title,
      description: campaign.description,
      code: campaign.code,
      discount_percent: campaign.discountPercent,
      image_url: campaign.image,
      starts_at: campaign.startsAt,
      ends_at: campaign.endsAt,
      active: campaign.active,
    };
    const { data, error } = await sb.from("campaigns").upsert(row).select("*").single();
    if (error) throw error;
    await sb.from("campaign_categories").delete().eq("campaign_id", data.id);
    if (campaign.categoryIds.length) {
      await sb.from("campaign_categories").insert(
        campaign.categoryIds.map((categoryId) => ({
          campaign_id: data.id,
          category_id: categoryId,
        })),
      );
    }
    return mapCampaign(data as Record<string, unknown>, campaign.categoryIds);
  },

  async removeCampaign(id) {
    const { error } = await getSupabase().from("campaigns").delete().eq("id", id);
    if (error) throw error;
  },

  async media() {
    const { data, error } = await getSupabase()
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapMedia(row as Record<string, unknown>));
  },

  async settings() {
    const { data, error } = await getSupabase()
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return mapSettings({});
    }
    return mapSettings(data as Record<string, unknown>);
  },

  async updateSettings(patch: Partial<SiteSettings>) {
    const current = await this.settings();
    const next = { ...current, ...patch };
    const { data, error } = await getSupabase()
      .from("site_settings")
      .upsert({
        id: 1,
        brand_name: next.brandName,
        logo_url: next.logoUrl,
        favicon_url: next.faviconUrl,
        phone: next.phone,
        whatsapp: next.whatsapp,
        email: next.email,
        address: next.address,
        seo: next.seo,
        smtp: next.smtp,
        analytics: next.analytics,
        maps: next.maps,
        exchange_rates: next.exchangeRates,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapSettings(data as Record<string, unknown>);
  },

  async notifications(userId) {
    const { data, error } = await getSupabase()
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapNotification(row as Record<string, unknown>));
  },

  async markNotificationRead(id) {
    const { error } = await getSupabase()
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    if (error) throw error;
  },

  async invoices(userId) {
    let query = getSupabase().from("invoices").select("*").order("issued_at", {
      ascending: false,
    });
    if (userId) query = query.eq("user_id", userId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => mapInvoice(row as Record<string, unknown>));
  },

  async dashboardStats() {
    const sb = getSupabase();
    const today = new Date().toISOString().slice(0, 10);
    const [{ data: vehicles }, { data: bookings }, { data: profiles }] =
      await Promise.all([
        sb.from("vehicles").select("id, status"),
        sb.from("bookings").select("id, status, total, pickup_at, return_at"),
        sb.from("profiles").select("id, role"),
      ]);
    const stats: DashboardStats = {
      totalVehicles: vehicles?.length ?? 0,
      availableVehicles: (vehicles ?? []).filter((v) => v.status === "available").length,
      totalBookings: bookings?.length ?? 0,
      pendingBookings: (bookings ?? []).filter((b) => b.status === "pending").length,
      revenue: (bookings ?? [])
        .filter((b) => b.status !== "cancelled")
        .reduce((sum, b) => sum + Number(b.total), 0),
      todayPickups: (bookings ?? []).filter((b) =>
        String(b.pickup_at).startsWith(today),
      ).length,
      todayReturns: (bookings ?? []).filter((b) =>
        String(b.return_at).startsWith(today),
      ).length,
      customers: (profiles ?? []).filter((p) => p.role === "customer").length,
      occupancyRate:
        vehicles && vehicles.length
          ? Math.round(
              ((vehicles.filter((v) => v.status === "rented").length) /
                vehicles.length) *
                100,
            )
          : 0,
    };
    return stats;
  },

  async contact(_input: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }) {
    return { ok: true as const };
  },
};
