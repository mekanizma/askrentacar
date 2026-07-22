export type LocaleCode = "tr" | "en" | "ru";
export type CurrencyCode = "TRY" | "GBP" | "EUR";
export type UserRole = "guest" | "customer" | "admin";

export type FuelType = "petrol" | "diesel" | "hybrid" | "electric";
export type Transmission = "automatic" | "manual";
export type VehicleStatus = "available" | "rented" | "maintenance" | "inactive";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "delivered"
  | "cancelled"
  | "completed";

export interface LocalizedString {
  tr: string;
  en: string;
  ru: string;
}

export interface MediaAsset {
  id: string;
  url: string;
  alt: string;
  type: "image" | "video" | "360";
  order: number;
}

export interface Category {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  icon: string;
  image: string;
  vehicleCount: number;
  featured: boolean;
}

export interface Location {
  id: string;
  slug: string;
  name: LocalizedString;
  city: string;
  address: LocalizedString;
  lat: number;
  lng: number;
  phone: string;
  isAirport: boolean;
}

export interface VehicleSpecs {
  year: number;
  fuel: FuelType;
  transmission: Transmission;
  seats: number;
  bags: number;
  doors: number;
  ac: boolean;
  engine: string;
  horsepower: number;
  consumption: string;
  drivetrain: string;
}

export interface VehiclePricing {
  daily: number;
  weekly: number;
  monthly: number;
  currency: CurrencyCode;
  discountPercent: number;
  deposit: number;
  insuranceDaily: number;
}

export interface VehicleBlockedPeriod {
  id: string;
  start: string;
  end: string;
  reason: string;
}

export interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  plate: string;
  chassis: string;
  categoryId: string;
  status: VehicleStatus;
  featured: boolean;
  rating: number;
  reviewCount: number;
  mileage: number;
  specs: VehicleSpecs;
  pricing: VehiclePricing;
  features: string[];
  images: MediaAsset[];
  videoUrl?: string;
  description: LocalizedString;
  insuranceExpiry: string;
  maintenanceDue: string;
  inspectionDue: string;
  blockedPeriods?: VehicleBlockedPeriod[];
  createdAt: string;
  updatedAt: string;
}

export interface AddOn {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  priceDaily: number;
  icon: string;
  mandatory: boolean;
}

export interface Review {
  id: string;
  vehicleId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verified: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  locale: LocaleCode;
  currency: CurrencyCode;
  avatar?: string;
  licenseNumber?: string;
  passportNumber?: string;
  notes?: string;
  favoriteVehicleIds: string[];
  createdAt: string;
}

export interface BookingAddOn {
  addOnId: string;
  quantity: number;
  unitPrice: number;
}

export interface Booking {
  id: string;
  code: string;
  userId: string;
  vehicleId: string;
  status: BookingStatus;
  pickupLocationId: string;
  dropoffLocationId: string;
  pickupAt: string;
  returnAt: string;
  addOns: BookingAddOn[];
  dailyRate: number;
  days: number;
  subtotal: number;
  discount: number;
  extrasTotal: number;
  insuranceTotal: number;
  tax: number;
  total: number;
  currency: CurrencyCode;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    licenseFrontUrl?: string;
    licenseBackUrl?: string;
    licenseFrontName?: string;
    licenseBackName?: string;
  };
  paymentMethod: "card" | "cash" | "transfer";
  paymentStatus: "pending" | "paid" | "refunded";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  readingMinutes: number;
  seoTitle: LocalizedString;
  seoDescription: LocalizedString;
}

export interface Campaign {
  id: string;
  slug: string;
  title: LocalizedString;
  description: LocalizedString;
  code: string;
  discountPercent: number;
  image: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  categoryIds: string[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  href?: string;
}

export interface Invoice {
  id: string;
  bookingId: string;
  userId: string;
  number: string;
  amount: number;
  currency: CurrencyCode;
  issuedAt: string;
  status: "paid" | "due" | "void";
  pdfUrl?: string;
}

export interface SiteSettings {
  brandName: string;
  logoUrl: string;
  faviconUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: LocalizedString;
  seo: {
    title: LocalizedString;
    description: LocalizedString;
    keywords: string[];
  };
  smtp: {
    host: string;
    port: number;
    user: string;
    from: string;
  };
  analytics: {
    gaId: string;
    gtmId: string;
  };
  maps: {
    embedUrl: string;
    lat: number;
    lng: number;
  };
  exchangeRates: Record<CurrencyCode, number>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VehicleFilters {
  q?: string;
  categoryId?: string;
  categorySlug?: string;
  fuel?: FuelType;
  transmission?: Transmission;
  seatsMin?: number;
  priceMin?: number;
  priceMax?: number;
  pickupLocationId?: string;
  dropoffLocationId?: string;
  pickupAt?: string;
  returnAt?: string;
  status?: VehicleStatus;
  featured?: boolean;
  sort?: "price_asc" | "price_desc" | "rating" | "newest" | "popular";
  page?: number;
  pageSize?: number;
}

export interface BookingFilters {
  q?: string;
  status?: BookingStatus;
  userId?: string;
  vehicleId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface AuthSession {
  user: Omit<UserProfile, "password">;
  token: string;
  expiresAt: string;
}

export interface PriceQuote {
  vehicleId: string;
  days: number;
  dailyRate: number;
  subtotal: number;
  discount: number;
  extrasTotal: number;
  insuranceTotal: number;
  tax: number;
  total: number;
  currency: CurrencyCode;
}

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  totalBookings: number;
  pendingBookings: number;
  revenue: number;
  todayPickups: number;
  todayReturns: number;
  customers: number;
  occupancyRate: number;
}
