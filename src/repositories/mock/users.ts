import { STORAGE_KEYS } from "@/constants";
import type { AuthSession, UserProfile } from "@/types";
import type { AuthRepository, UserRepository } from "@/repositories/contracts";
import { getDatabase, persistDatabase, withLatency } from "@/repositories/mock/db";

function toSession(user: UserProfile): AuthSession {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safe } = user;
  return {
    user: safe,
    token: `mock_token_${user.id}`,
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  };
}

function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.session);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (!session) localStorage.removeItem(STORAGE_KEYS.session);
  else localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

export const mockUserRepository: UserRepository = {
  async list(q) {
    let users = getDatabase().users;
    if (q) {
      const query = q.toLowerCase();
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(query) ||
          u.firstName.toLowerCase().includes(query) ||
          u.lastName.toLowerCase().includes(query),
      );
    }
    return withLatency(users);
  },
  async getById(id) {
    return withLatency(getDatabase().users.find((u) => u.id === id) ?? null);
  },
  async getByEmail(email) {
    return withLatency(
      getDatabase().users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null,
    );
  },
  async create(input) {
    const db = getDatabase();
    if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("Email already registered");
    }
    const user: UserProfile = {
      ...input,
      id: `user_${Date.now()}`,
      favoriteVehicleIds: [],
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    persistDatabase();
    return withLatency(user);
  },
  async update(id, patch) {
    const db = getDatabase();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx < 0) throw new Error("User not found");
    db.users[idx] = { ...db.users[idx]!, ...patch, id };
    persistDatabase();
    const session = readSession();
    if (session?.user.id === id) {
      writeSession(toSession(db.users[idx]!));
    }
    return withLatency(db.users[idx]!);
  },
  async toggleFavorite(userId, vehicleId) {
    const db = getDatabase();
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx < 0) throw new Error("User not found");
    const favs = new Set(db.users[idx]!.favoriteVehicleIds);
    if (favs.has(vehicleId)) favs.delete(vehicleId);
    else favs.add(vehicleId);
    db.users[idx]!.favoriteVehicleIds = [...favs];
    persistDatabase();
    const session = readSession();
    if (session?.user.id === userId) writeSession(toSession(db.users[idx]!));
    return withLatency(db.users[idx]!);
  },
};

export const mockAuthRepository: AuthRepository = {
  async login(email, password) {
    const user = getDatabase().users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!user) throw new Error("Invalid email or password");
    const session = toSession(user);
    writeSession(session);
    return withLatency(session);
  },
  async register(input) {
    const user = await mockUserRepository.create({
      ...input,
      role: "customer",
      locale: "tr",
      currency: "EUR",
    });
    const session = toSession(user);
    writeSession(session);
    return withLatency(session);
  },
  async logout() {
    writeSession(null);
    await withLatency(undefined, 80);
  },
  async currentSession() {
    return withLatency(readSession(), 40);
  },
  async requestPasswordReset(email) {
    const user = await mockUserRepository.getByEmail(email);
    if (!user) throw new Error("No account found for this email");
    return withLatency({
      ok: true as const,
      message: "Mock reset link sent. Use Demo123! or your current password to sign in.",
    });
  },
};
