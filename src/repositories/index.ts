import type { Repositories } from "@/repositories/contracts";
import { mockBookingRepository } from "@/repositories/mock/bookings";
import { mockContentRepository } from "@/repositories/mock/content";
import { mockAuthRepository, mockUserRepository } from "@/repositories/mock/users";
import { mockVehicleRepository } from "@/repositories/mock/vehicles";
import { supabaseBookingRepository } from "@/repositories/supabase/bookings";
import { supabaseContentRepository } from "@/repositories/supabase/content";
import { supabaseAuthRepository, supabaseUserRepository } from "@/repositories/supabase/users";
import { supabaseVehicleRepository } from "@/repositories/supabase/vehicles";

/**
 * Data-source factory.
 * Set NEXT_PUBLIC_DATA_PROVIDER=supabase to use live Supabase.
 */
export type DataProvider = "mock" | "supabase";

const provider = (
  process.env.NEXT_PUBLIC_DATA_PROVIDER === "supabase" ? "supabase" : "mock"
) as DataProvider;

export function createRepositories(): Repositories {
  if (provider === "supabase") {
    return {
      vehicles: supabaseVehicleRepository,
      bookings: supabaseBookingRepository,
      users: supabaseUserRepository,
      auth: supabaseAuthRepository,
      content: supabaseContentRepository,
    };
  }

  return {
    vehicles: mockVehicleRepository,
    bookings: mockBookingRepository,
    users: mockUserRepository,
    auth: mockAuthRepository,
    content: mockContentRepository,
  };
}

export const repositories = createRepositories();
