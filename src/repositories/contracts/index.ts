import type {
  AuthSession,
  BlogPost,
  Booking,
  BookingFilters,
  Campaign,
  Category,
  DashboardStats,
  Invoice,
  Location,
  MediaAsset,
  NotificationItem,
  PaginatedResult,
  PriceQuote,
  Review,
  SiteSettings,
  UserProfile,
  Vehicle,
  VehicleBusyPeriod,
  VehicleFilters,
  AddOn,
} from "@/types";

export interface VehicleRepository {
  list(filters?: VehicleFilters): Promise<PaginatedResult<Vehicle>>;
  getById(id: string): Promise<Vehicle | null>;
  getBySlug(slug: string): Promise<Vehicle | null>;
  create(input: Omit<Vehicle, "id" | "createdAt" | "updatedAt">): Promise<Vehicle>;
  update(id: string, patch: Partial<Vehicle>): Promise<Vehicle>;
  remove(id: string): Promise<void>;
  similar(vehicleId: string, limit?: number): Promise<Vehicle[]>;
}

export interface BookingRepository {
  list(filters?: BookingFilters): Promise<PaginatedResult<Booking>>;
  getById(id: string): Promise<Booking | null>;
  getByCode(code: string): Promise<Booking | null>;
  /** Active (non-cancelled) rental windows for a vehicle — safe for public calendars. */
  busyPeriods(vehicleId: string): Promise<VehicleBusyPeriod[]>;
  create(input: Omit<Booking, "id" | "code" | "createdAt" | "updatedAt">): Promise<Booking>;
  update(id: string, patch: Partial<Booking>): Promise<Booking>;
  remove(id: string): Promise<void>;
  quote(input: {
    vehicleId: string;
    pickupAt: string;
    returnAt: string;
    addOnIds?: string[];
    campaignCode?: string;
  }): Promise<PriceQuote>;
}

export interface UserRepository {
  list(q?: string): Promise<UserProfile[]>;
  getById(id: string): Promise<UserProfile | null>;
  getByEmail(email: string): Promise<UserProfile | null>;
  create(input: Omit<UserProfile, "id" | "createdAt" | "favoriteVehicleIds">): Promise<UserProfile>;
  update(id: string, patch: Partial<UserProfile>): Promise<UserProfile>;
  toggleFavorite(userId: string, vehicleId: string): Promise<UserProfile>;
}

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthSession>;
  register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }): Promise<AuthSession>;
  logout(): Promise<void>;
  currentSession(): Promise<AuthSession | null>;
  requestPasswordReset(email: string): Promise<{ ok: true; message: string }>;
}

export interface ContentRepository {
  categories(): Promise<Category[]>;
  locations(): Promise<Location[]>;
  addOns(): Promise<AddOn[]>;
  reviews(vehicleId?: string): Promise<Review[]>;
  blogPosts(q?: string): Promise<BlogPost[]>;
  blogBySlug(slug: string): Promise<BlogPost | null>;
  saveBlog(post: BlogPost): Promise<BlogPost>;
  removeBlog(id: string): Promise<void>;
  campaigns(): Promise<Campaign[]>;
  saveCampaign(campaign: Campaign): Promise<Campaign>;
  removeCampaign(id: string): Promise<void>;
  media(): Promise<MediaAsset[]>;
  settings(): Promise<SiteSettings>;
  updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings>;
  notifications(userId: string): Promise<NotificationItem[]>;
  markNotificationRead(id: string): Promise<void>;
  invoices(userId?: string): Promise<Invoice[]>;
  dashboardStats(): Promise<DashboardStats>;
  contact(input: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }): Promise<{ ok: true }>;
}

export interface Repositories {
  vehicles: VehicleRepository;
  bookings: BookingRepository;
  users: UserRepository;
  auth: AuthRepository;
  content: ContentRepository;
}
