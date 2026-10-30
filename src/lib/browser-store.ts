import { useSyncExternalStore } from "react";

/*
 * Small helpers for reading things that only exist in the browser (localStorage, the URL, the clock)
 * without calling setState in an effect. The server and the first render see a fallback;
 * React swaps in the browser's value right after hydration.
 */

type Updater<T> = T | ((prev: T) => T);

export type BrowserStore<T> = {
  get: () => T;
  set: (next: Updater<T>) => void;
  subscribe: (onChange: () => void) => () => void;
  fallback: T;
};

/**
 * A JSON value kept in localStorage (or sessionStorage) that components can subscribe to.
 * Other tabs stay in sync through the storage event. If storage is blocked (some private modes),
 * the value lives in memory until the page reloads.
 */
export function browserStore<T>(key: string, fallback: T, parse: (raw: unknown) => T = (v) => v as T, area: "local" | "session" = "local"): BrowserStore<T> {
  const listeners = new Set<() => void>();
  let cache: { raw: string | null; value: T } | null = null;
  let blocked = false;
  const storage = () => (area === "local" ? window.localStorage : window.sessionStorage);

  function get(): T {
    if (blocked) return cache?.value ?? fallback;
    let raw: string | null;
    try {
      raw = storage().getItem(key);
    } catch {
      blocked = true;
      return cache?.value ?? fallback;
    }
    // same text, same object: React needs a stable snapshot
    if (cache && cache.raw === raw) return cache.value;
    let value = fallback;
    if (raw) {
      try {
        value = parse(JSON.parse(raw));
      } catch {
        value = fallback;
      }
    }
    cache = { raw, value };
    return value;
  }

  function set(next: Updater<T>) {
    const value = typeof next === "function" ? (next as (prev: T) => T)(get()) : next;
    const raw = JSON.stringify(value);
    try {
      storage().setItem(key, raw);
    } catch {
      blocked = true;
    }
    cache = { raw, value };
    listeners.forEach((l) => l());
  }

  function subscribe(onChange: () => void) {
    listeners.add(onChange);
    const onStorage = (e: StorageEvent) => e.key === key && onChange();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onStorage);
    };
  }

  return { get, set, subscribe, fallback };
}

export function useBrowserStore<T>(store: BrowserStore<T>) {
  return useSyncExternalStore(store.subscribe, store.get, () => store.fallback);
}

const never = () => () => {};

/** False on the server and during hydration, true after: for things that only make sense in the browser */
export function useHydrated() {
  return useSyncExternalStore(never, () => true, () => false);
}

/** The page's query string ("?grind=filter"), or "" on the server */
export function useSearch() {
  return useSyncExternalStore(never, () => window.location.search, () => "");
}

let loadedAt = 0;
/** When the page was opened, fixed for the visit so lists built from it stay stable; 0 on the server */
export function useNow() {
  return useSyncExternalStore(never, () => (loadedAt ||= Date.now()), () => 0);
}
