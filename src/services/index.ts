import { repositories } from "@/repositories";
import type {
  BookingFilters,
  LocaleCode,
  VehicleFilters,
} from "@/types";
import {
  bookingCustomerSchema,
  contactSchema,
  loginSchema,
  registerSchema,
  searchSchema,
} from "@/lib/validations";

export const vehicleService = {
  list: (filters?: VehicleFilters) => repositories.vehicles.list(filters),
  bySlug: (slug: string) => repositories.vehicles.getBySlug(slug),
  byId: (id: string) => repositories.vehicles.getById(id),
  similar: (id: string) => repositories.vehicles.similar(id),
  create: repositories.vehicles.create,
  update: repositories.vehicles.update,
  remove: repositories.vehicles.remove,
};

export const bookingService = {
  list: (filters?: BookingFilters) => repositories.bookings.list(filters),
  byId: (id: string) => repositories.bookings.getById(id),
  byCode: (code: string) => repositories.bookings.getByCode(code),
  busyPeriods: (vehicleId: string) => repositories.bookings.busyPeriods(vehicleId),
  quote: repositories.bookings.quote,
  create: repositories.bookings.create,
  update: repositories.bookings.update,
  remove: repositories.bookings.remove,
};

export const authService = {
  async login(input: unknown) {
    const data = loginSchema.parse(input);
    return repositories.auth.login(data.email, data.password);
  },
  async register(input: unknown) {
    const data = registerSchema.parse(input);
    return repositories.auth.register(data);
  },
  logout: () => repositories.auth.logout(),
  session: () => repositories.auth.currentSession(),
  reset: (email: string) => repositories.auth.requestPasswordReset(email),
};

export const userService = {
  list: (q?: string) => repositories.users.list(q),
  byId: (id: string) => repositories.users.getById(id),
  update: repositories.users.update,
  toggleFavorite: repositories.users.toggleFavorite,
};

export const contentService = {
  categories: () => repositories.content.categories(),
  locations: () => repositories.content.locations(),
  addOns: () => repositories.content.addOns(),
  reviews: (vehicleId?: string) => repositories.content.reviews(vehicleId),
  blogPosts: (q?: string) => repositories.content.blogPosts(q),
  blogBySlug: (slug: string) => repositories.content.blogBySlug(slug),
  saveBlog: repositories.content.saveBlog,
  removeBlog: repositories.content.removeBlog,
  campaigns: () => repositories.content.campaigns(),
  saveCampaign: repositories.content.saveCampaign,
  removeCampaign: repositories.content.removeCampaign,
  media: () => repositories.content.media(),
  settings: () => repositories.content.settings(),
  updateSettings: repositories.content.updateSettings,
  notifications: (userId: string) => repositories.content.notifications(userId),
  markNotificationRead: repositories.content.markNotificationRead,
  invoices: (userId?: string) => repositories.content.invoices(userId),
  dashboardStats: () => repositories.content.dashboardStats(),
  async contact(input: unknown) {
    const data = contactSchema.parse(input);
    return repositories.content.contact(data);
  },
};

export const searchService = {
  parse(input: unknown) {
    return searchSchema.parse(input);
  },
};

export const bookingFlowService = {
  parseCustomer(input: unknown) {
    return bookingCustomerSchema.parse(input);
  },
};

export function localize<T extends Record<LocaleCode, string>>(value: T, locale: LocaleCode) {
  return value[locale] || value.en || value.tr;
}
