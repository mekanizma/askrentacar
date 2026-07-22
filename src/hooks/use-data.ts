"use client";

import { useQuery } from "@tanstack/react-query";
import {
  bookingService,
  contentService,
  userService,
  vehicleService,
} from "@/services";
import type { BookingFilters, VehicleFilters } from "@/types";

export function useVehicles(filters?: VehicleFilters) {
  return useQuery({
    queryKey: ["vehicles", filters],
    queryFn: () => vehicleService.list(filters),
  });
}

export function useVehicle(slug: string) {
  return useQuery({
    queryKey: ["vehicle", slug],
    queryFn: () => vehicleService.bySlug(slug),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: contentService.categories });
}

export function useLocations() {
  return useQuery({ queryKey: ["locations"], queryFn: contentService.locations });
}

export function useAddOns() {
  return useQuery({ queryKey: ["addons"], queryFn: contentService.addOns });
}

export function useCampaigns() {
  return useQuery({ queryKey: ["campaigns"], queryFn: contentService.campaigns });
}

export function useBlogPosts(q?: string) {
  return useQuery({ queryKey: ["blog", q], queryFn: () => contentService.blogPosts(q) });
}

export function useBookings(filters?: BookingFilters) {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => bookingService.list(filters),
  });
}

export function useDashboardStats() {
  return useQuery({ queryKey: ["dashboard-stats"], queryFn: contentService.dashboardStats });
}

export function useUsers(q?: string) {
  return useQuery({ queryKey: ["users", q], queryFn: () => userService.list(q) });
}

export function useReviews(vehicleId?: string) {
  return useQuery({
    queryKey: ["reviews", vehicleId],
    queryFn: () => contentService.reviews(vehicleId),
  });
}
