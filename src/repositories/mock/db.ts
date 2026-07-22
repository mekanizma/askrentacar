import { MOCK_LATENCY_MS, STORAGE_KEYS } from "@/constants";
import { createSeedDatabase, type MockDatabase } from "@/mock/seed";

let memoryDb: MockDatabase | null = null;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getDatabase(): MockDatabase {
  if (memoryDb) return memoryDb;

  if (canUseStorage()) {
    const raw = localStorage.getItem(STORAGE_KEYS.db);
    if (raw) {
      try {
        memoryDb = JSON.parse(raw) as MockDatabase;
        return memoryDb;
      } catch {
        // fall through to seed
      }
    }
  }

  memoryDb = structuredClone(createSeedDatabase());
  schedulePersist();
  return memoryDb;
}

function schedulePersist() {
  if (!memoryDb || !canUseStorage()) return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    if (!memoryDb) return;
    try {
      localStorage.setItem(STORAGE_KEYS.db, JSON.stringify(memoryDb));
    } catch {
      // Quota exceeded — ignore; in-memory DB still works
    }
  }, 0);
}

export function persistDatabase() {
  schedulePersist();
}

export function resetDatabase() {
  memoryDb = structuredClone(createSeedDatabase());
  schedulePersist();
  return memoryDb;
}

export async function withLatency<T>(result: T, ms = MOCK_LATENCY_MS): Promise<T> {
  if (ms > 0) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
  return result;
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
