import type { AuthSession, UserProfile } from "@/types";
import type { AuthRepository, UserRepository } from "@/repositories/contracts";
import { getSupabase } from "@/lib/supabase/client";
import { mapProfile } from "@/repositories/supabase/mappers";

async function favoritesFor(userId: string) {
  const { data } = await getSupabase()
    .from("favorites")
    .select("vehicle_id")
    .eq("user_id", userId);
  return (data ?? []).map((row) => row.vehicle_id as string);
}

async function profileById(id: string): Promise<UserProfile | null> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapProfile(data as Record<string, unknown>, await favoritesFor(id));
}

function toSession(user: UserProfile, token: string, expiresAt: string): AuthSession {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safe } = user;
  return { user: safe, token, expiresAt };
}

export const supabaseUserRepository: UserRepository = {
  async list(q) {
    const sb = getSupabase();
    const { data, error } = await sb.from("profiles").select("*").order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    let users = await Promise.all(
      (data ?? []).map(async (row) =>
        mapProfile(row as Record<string, unknown>, await favoritesFor(String(row.id))),
      ),
    );
    if (q) {
      const query = q.toLowerCase();
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(query) ||
          u.firstName.toLowerCase().includes(query) ||
          u.lastName.toLowerCase().includes(query),
      );
    }
    return users;
  },

  async getById(id) {
    return profileById(id);
  },

  async getByEmail(email) {
    const { data, error } = await getSupabase()
      .from("profiles")
      .select("*")
      .ilike("email", email)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapProfile(
      data as Record<string, unknown>,
      await favoritesFor(String(data.id)),
    );
  },

  async create(input) {
    const sb = getSupabase();
    const { data: authData, error: authError } = await sb.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
          phone: input.phone,
          role: input.role || "customer",
          locale: input.locale || "tr",
          currency: input.currency || "EUR",
        },
      },
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error("Registration failed");

    await sb
      .from("profiles")
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        role: input.role || "customer",
        locale: input.locale || "tr",
        currency: input.currency || "EUR",
        notes: input.notes ?? null,
      })
      .eq("id", authData.user.id);

    const profile = await profileById(authData.user.id);
    if (!profile) throw new Error("Profile create failed");
    return profile;
  },

  async update(id, patch) {
    const payload: Record<string, unknown> = {};
    if (patch.firstName !== undefined) payload.first_name = patch.firstName;
    if (patch.lastName !== undefined) payload.last_name = patch.lastName;
    if (patch.phone !== undefined) payload.phone = patch.phone;
    if (patch.role !== undefined) payload.role = patch.role;
    if (patch.locale !== undefined) payload.locale = patch.locale;
    if (patch.currency !== undefined) payload.currency = patch.currency;
    if (patch.avatar !== undefined) payload.avatar_url = patch.avatar;
    if (patch.licenseNumber !== undefined) payload.license_number = patch.licenseNumber;
    if (patch.passportNumber !== undefined) payload.passport_number = patch.passportNumber;
    if (patch.notes !== undefined) payload.notes = patch.notes;
    if (Object.keys(payload).length) {
      const { error } = await getSupabase().from("profiles").update(payload).eq("id", id);
      if (error) throw error;
    }
    const updated = await profileById(id);
    if (!updated) throw new Error("User not found");
    return updated;
  },

  async toggleFavorite(userId, vehicleId) {
    const sb = getSupabase();
    const { data: existing } = await sb
      .from("favorites")
      .select("vehicle_id")
      .eq("user_id", userId)
      .eq("vehicle_id", vehicleId)
      .maybeSingle();
    if (existing) {
      const { error } = await sb
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("vehicle_id", vehicleId);
      if (error) throw error;
    } else {
      const { error } = await sb
        .from("favorites")
        .insert({ user_id: userId, vehicle_id: vehicleId });
      if (error) throw error;
    }
    const updated = await profileById(userId);
    if (!updated) throw new Error("User not found");
    return updated;
  },
};

export const supabaseAuthRepository: AuthRepository = {
  async login(email, password) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message || "Invalid email or password");
    if (!data.user || !data.session) throw new Error("Invalid email or password");
    const profile = await profileById(data.user.id);
    if (!profile) throw new Error("Profile not found");
    return toSession(
      profile,
      data.session.access_token,
      new Date(data.session.expires_at ? data.session.expires_at * 1000 : Date.now()).toISOString(),
    );
  },

  async register(input) {
    const user = await supabaseUserRepository.create({
      ...input,
      role: "customer",
      locale: "tr",
      currency: "EUR",
    });
    const sb = getSupabase();
    const { data } = await sb.auth.getSession();
    return toSession(
      user,
      data.session?.access_token ?? `sb_${user.id}`,
      data.session?.expires_at
        ? new Date(data.session.expires_at * 1000).toISOString()
        : new Date(Date.now() + 7 * 86400000).toISOString(),
    );
  },

  async logout() {
    await getSupabase().auth.signOut();
  },

  async currentSession() {
    const sb = getSupabase();
    const { data } = await sb.auth.getSession();
    if (!data.session?.user) return null;
    const profile = await profileById(data.session.user.id);
    if (!profile) return null;
    return toSession(
      profile,
      data.session.access_token,
      new Date(
        data.session.expires_at ? data.session.expires_at * 1000 : Date.now(),
      ).toISOString(),
    );
  },

  async requestPasswordReset(email) {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { ok: true as const, message: "Password reset email sent." };
  },
};
