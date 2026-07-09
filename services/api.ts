const getApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `http://${hostname}:8000`;
    }
  }
  return "http://localhost:8000";
};

export const API_URL = getApiUrl();

export const getWebSocketUrl = (path: string) => {
  const url = API_URL.replace(/^http/, "ws");
  return `${url}${path.startsWith("/") ? "" : "/"}${path}`;
};

import { getAuthInstance } from "../firebaseConfig";

async function getAuthHeaders() {
  let token = localStorage.getItem("appToken");
  try {
    const auth = getAuthInstance();
    if (auth && auth.currentUser) {
      token = await auth.currentUser.getIdToken();
    }
  } catch (err) {
    console.warn("Failed to get fresh Firebase token", err);
  }
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

// --- Simple in-memory cache for GET requests ---
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
  // Prevent unbounded cache growth
  if (cache.size > 100) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
}

// Invalidate cache for a specific endpoint or all
export function invalidateCache(endpoint?: string) {
  if (endpoint) {
    cache.delete(endpoint);
  } else {
    cache.clear();
  }
}

// --- Deduplicate concurrent identical GET requests ---
const inflightRequests = new Map<string, Promise<any>>();

export const api = {
  get: async (endpoint: string, options?: { skipCache?: boolean }) => {
    // Check cache first
    if (!options?.skipCache) {
      const cached = getCached(endpoint);
      if (cached) return cached;
    }

    // Deduplicate concurrent identical requests
    const inflight = inflightRequests.get(endpoint);
    if (inflight) return inflight;

    const promise = (async () => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}${endpoint}`, { headers });
      if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
      const data = await res.json();
      setCache(endpoint, data);
      return data;
    })();

    inflightRequests.set(endpoint, promise);
    try {
      return await promise;
    } finally {
      inflightRequests.delete(endpoint);
    }
  },
  post: async (endpoint: string, body: any) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    // Invalidate related caches on mutation
    invalidateCache();
    return res.json();
  },
  put: async (endpoint: string, body: any = {}) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    invalidateCache();
    return res.json();
  },
  delete: async (endpoint: string) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    invalidateCache();
    return res.json();
  },
};
