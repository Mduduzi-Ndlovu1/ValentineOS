// Unique per browser tab — used to ignore our own realtime events
export const SESSION_ID = typeof crypto !== "undefined"
  ? crypto.randomUUID()
  : Math.random().toString(36).slice(2);

// Track IDs we recently modified so we can skip our own realtime events
const recentlyModified = new Set<string>();

export function markAsOurs(id: string) {
  recentlyModified.add(id);
  setTimeout(() => recentlyModified.delete(id), 5000);
}

export function isOurs(id: string): boolean {
  return recentlyModified.has(id);
}

console.log(`[ValentineOS] Session ID: ${SESSION_ID}`);
