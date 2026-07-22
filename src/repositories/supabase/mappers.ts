import type {
  AddOn,
  BlogPost,
  Booking,
  Campaign,
  Category,
  CurrencyCode,
  Invoice,
  LocaleCode,
  Location,
  MediaAsset,
  NotificationItem,
  Review,
  SiteSettings,
  UserProfile,
  UserRole,
  Vehicle,
} from "@/types";

export type Localized = { tr?: string; en?: string; ru?: string };

export function asLocalized(value: unknown): { tr: string; en: string; ru: string } {
  const v = (value ?? {}) as Localized;
  return {
    tr: v.tr ?? "",
    en: v.en ?? "",
    ru: v.ru ?? "",
  };
}

export function mapProfile(
  row: Record<string, unknown>,
  favoriteVehicleIds: string[] = [],
): UserProfile {
  return {
    id: String(row.id),
    email: String(row.email ?? ""),
    password: "",
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    phone: String(row.phone ?? ""),
    role: (row.role as UserRole) || "customer",
    locale: (row.locale as LocaleCode) || "tr",
    currency: (row.currency as CurrencyCode) || "EUR",
    avatar: (row.avatar_url as string) || undefined,
    licenseNumber: (row.license_number as string) || undefined,
    passportNumber: (row.passport_number as string) || undefined,
    notes: (row.notes as string) || undefined,
    favoriteVehicleIds,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export function mapCategory(row: Record<string, unknown>, vehicleCount = 0): Category {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: asLocalized(row.name),
    description: asLocalized(row.description),
    icon: String(row.icon ?? "car"),
    image: String(row.image_url ?? ""),
    vehicleCount,
    featured: Boolean(row.featured),
  };
}

export function mapLocation(row: Record<string, unknown>): Location {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: asLocalized(row.name),
    city: String(row.city ?? ""),
    address: asLocalized(row.address),
    lat: Number(row.lat ?? 0),
    lng: Number(row.lng ?? 0),
    phone: String(row.phone ?? ""),
    isAirport: Boolean(row.is_airport),
  };
}

export function mapVehicle(
  row: Record<string, unknown>,
  images: MediaAsset[] = [],
  blockedPeriods: Vehicle["blockedPeriods"] = [],
): Vehicle {
  return {
    id: String(row.id),
    slug: String(row.slug),
    brand: String(row.brand),
    model: String(row.model),
    plate: String(row.plate ?? ""),
    chassis: String(row.chassis ?? ""),
    categoryId: String(row.category_id ?? ""),
    status: row.status as Vehicle["status"],
    featured: Boolean(row.featured),
    rating: Number(row.rating ?? 5),
    reviewCount: Number(row.review_count ?? 0),
    mileage: Number(row.mileage ?? 0),
    specs: {
      year: Number(row.year),
      fuel: row.fuel as Vehicle["specs"]["fuel"],
      transmission: row.transmission as Vehicle["specs"]["transmission"],
      seats: Number(row.seats ?? 5),
      bags: Number(row.bags ?? 2),
      doors: Number(row.doors ?? 4),
      ac: Boolean(row.ac ?? true),
      engine: String(row.engine ?? ""),
      horsepower: Number(row.horsepower ?? 0),
      consumption: String(row.consumption ?? ""),
      drivetrain: String(row.drivetrain ?? ""),
    },
    pricing: {
      daily: Number(row.price_daily),
      weekly: Number(row.price_weekly ?? Number(row.price_daily) * 6),
      monthly: Number(row.price_monthly ?? Number(row.price_daily) * 22),
      currency: (row.currency as CurrencyCode) || "EUR",
      discountPercent: Number(row.discount_percent ?? 0),
      deposit: Number(row.deposit ?? 0),
      insuranceDaily: Number(row.insurance_daily ?? 0),
    },
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    images,
    videoUrl: (row.video_url as string) || undefined,
    description: asLocalized(row.description),
    insuranceExpiry: String(row.insurance_expiry ?? ""),
    maintenanceDue: String(row.maintenance_due ?? ""),
    inspectionDue: String(row.inspection_due ?? ""),
    blockedPeriods,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

export function vehicleToRow(input: Partial<Vehicle> & { brand?: string; model?: string }) {
  return {
    slug: input.slug,
    brand: input.brand,
    model: input.model,
    plate: input.plate,
    chassis: input.chassis,
    category_id: input.categoryId || null,
    status: input.status,
    featured: input.featured,
    rating: input.rating,
    review_count: input.reviewCount,
    mileage: input.mileage,
    year: input.specs?.year,
    fuel: input.specs?.fuel,
    transmission: input.specs?.transmission,
    seats: input.specs?.seats,
    bags: input.specs?.bags,
    doors: input.specs?.doors,
    ac: input.specs?.ac,
    engine: input.specs?.engine,
    horsepower: input.specs?.horsepower,
    consumption: input.specs?.consumption,
    drivetrain: input.specs?.drivetrain,
    price_daily: input.pricing?.daily,
    price_weekly: input.pricing?.weekly,
    price_monthly: input.pricing?.monthly,
    currency: input.pricing?.currency,
    discount_percent: input.pricing?.discountPercent,
    deposit: input.pricing?.deposit,
    insurance_daily: input.pricing?.insuranceDaily,
    features: input.features ?? [],
    video_url: input.videoUrl ?? null,
    description: input.description,
    insurance_expiry: input.insuranceExpiry || null,
    maintenance_due: input.maintenanceDue || null,
    inspection_due: input.inspectionDue || null,
  };
}

export function mapBooking(
  row: Record<string, unknown>,
  addOns: Booking["addOns"] = [],
): Booking {
  return {
    id: String(row.id),
    code: String(row.code),
    userId: row.user_id ? String(row.user_id) : "guest",
    vehicleId: String(row.vehicle_id),
    status: row.status as Booking["status"],
    pickupLocationId: String(row.pickup_location_id ?? ""),
    dropoffLocationId: String(row.dropoff_location_id ?? ""),
    pickupAt: String(row.pickup_at),
    returnAt: String(row.return_at),
    addOns,
    dailyRate: Number(row.daily_rate),
    days: Number(row.days),
    subtotal: Number(row.subtotal),
    discount: Number(row.discount ?? 0),
    extrasTotal: Number(row.extras_total ?? 0),
    insuranceTotal: Number(row.insurance_total ?? 0),
    tax: Number(row.tax ?? 0),
    total: Number(row.total),
    currency: (row.currency as CurrencyCode) || "EUR",
    customer: {
      firstName: String(row.customer_first_name ?? ""),
      lastName: String(row.customer_last_name ?? ""),
      email: String(row.customer_email ?? ""),
      phone: String(row.customer_phone ?? ""),
      licenseFrontUrl: (row.license_front_url as string) || undefined,
      licenseBackUrl: (row.license_back_url as string) || undefined,
      licenseFrontName: (row.license_front_name as string) || undefined,
      licenseBackName: (row.license_back_name as string) || undefined,
    },
    paymentMethod: row.payment_method as Booking["paymentMethod"],
    paymentStatus: row.payment_status as Booking["paymentStatus"],
    notes: (row.notes as string) || undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

export function mapAddOn(row: Record<string, unknown>): AddOn {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: asLocalized(row.name),
    description: asLocalized(row.description),
    priceDaily: Number(row.price_daily ?? 0),
    icon: String(row.icon ?? "plus"),
    mandatory: Boolean(row.mandatory),
  };
}

export function mapReview(row: Record<string, unknown>): Review {
  return {
    id: String(row.id),
    vehicleId: String(row.vehicle_id),
    userId: String(row.user_id ?? ""),
    userName: String(row.user_name ?? ""),
    rating: Number(row.rating),
    title: String(row.title ?? ""),
    comment: String(row.comment ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    verified: Boolean(row.verified),
  };
}

export function mapBlog(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: asLocalized(row.title),
    excerpt: asLocalized(row.excerpt),
    content: asLocalized(row.content),
    coverImage: String(row.cover_image ?? ""),
    category: String(row.category ?? "News"),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    author: String(row.author ?? ""),
    publishedAt: String(row.published_at ?? new Date().toISOString()),
    readingMinutes: Number(row.reading_minutes ?? 5),
    seoTitle: asLocalized(row.seo_title),
    seoDescription: asLocalized(row.seo_description),
  };
}

export function mapCampaign(
  row: Record<string, unknown>,
  categoryIds: string[] = [],
): Campaign {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: asLocalized(row.title),
    description: asLocalized(row.description),
    code: String(row.code),
    discountPercent: Number(row.discount_percent ?? 0),
    image: String(row.image_url ?? ""),
    startsAt: String(row.starts_at),
    endsAt: String(row.ends_at),
    active: Boolean(row.active),
    categoryIds,
  };
}

export function mapNotification(row: Record<string, unknown>): NotificationItem {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    body: String(row.body),
    read: Boolean(row.read),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    href: (row.href as string) || undefined,
  };
}

export function mapInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: String(row.id),
    bookingId: String(row.booking_id),
    userId: String(row.user_id ?? ""),
    number: String(row.number),
    amount: Number(row.amount),
    currency: (row.currency as CurrencyCode) || "EUR",
    issuedAt: String(row.issued_at ?? new Date().toISOString()),
    status: row.status as Invoice["status"],
    pdfUrl: (row.pdf_url as string) || undefined,
  };
}

export function mapSettings(row: Record<string, unknown>): SiteSettings {
  const seo = (row.seo ?? {}) as SiteSettings["seo"];
  const smtp = (row.smtp ?? {}) as SiteSettings["smtp"];
  const analytics = (row.analytics ?? {}) as SiteSettings["analytics"];
  const maps = (row.maps ?? {}) as SiteSettings["maps"];
  const rates = (row.exchange_rates ?? { EUR: 1, GBP: 0.86, TRY: 36.5 }) as SiteSettings["exchangeRates"];
  return {
    brandName: String(row.brand_name ?? "ASK RENT A CAR"),
    logoUrl: String(row.logo_url ?? "/logo.png"),
    faviconUrl: String(row.favicon_url ?? "/logo.png"),
    phone: String(row.phone ?? ""),
    whatsapp: String(row.whatsapp ?? ""),
    email: String(row.email ?? ""),
    address: asLocalized(row.address),
    seo: {
      title: asLocalized(seo.title),
      description: asLocalized(seo.description),
      keywords: Array.isArray(seo.keywords) ? seo.keywords : [],
    },
    smtp: {
      host: smtp.host ?? "",
      port: Number(smtp.port ?? 587),
      user: smtp.user ?? "",
      from: smtp.from ?? "",
    },
    analytics: {
      gaId: analytics.gaId ?? "",
      gtmId: analytics.gtmId ?? "",
    },
    maps: {
      embedUrl: maps.embedUrl ?? "",
      lat: Number(maps.lat ?? 0),
      lng: Number(maps.lng ?? 0),
    },
    exchangeRates: {
      EUR: Number(rates.EUR ?? 1),
      GBP: Number(rates.GBP ?? 0.86),
      TRY: Number(rates.TRY ?? 36.5),
    },
  };
}

export function mapMedia(row: Record<string, unknown>): MediaAsset {
  return {
    id: String(row.id),
    url: String(row.url),
    alt: String(row.alt ?? ""),
    type: (row.type as MediaAsset["type"]) || "image",
    order: Number(row.sort_order ?? 0),
  };
}

export function paginate<T>(items: T[], page = 1, pageSize = 12) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}
