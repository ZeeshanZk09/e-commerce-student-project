// useGetUserSession.ts (improved)
'use client';

import axios from 'axios';
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { PublicUser } from '@/types/userType';

type Subscriber = () => void;
const STORAGE_KEY = 'e-com';

const DEBUG =
  process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DEBUG_SESSION === 'true';

let currentUser: PublicUser | null = null;
let inFlightFetch: Promise<PublicUser | null> | null = null;
const subscribers = new Set<Subscriber>();

function dbg(...args: any[]) {
  if (DEBUG) console.debug('[sessionStore]', ...args);
}

function emit() {
  dbg('emit -> notifying', subscribers.size, 'subscribers');
  for (const s of Array.from(subscribers)) s();
}

/** Normalize a server response -> PublicUser | null
 * Handles:
 * - server returns object { success: true, data: user }
 * - server returns object user directly
 * - server returns a JSON string of either of the above
 */
function extractUserFromAxiosResponse(res: any): PublicUser | null {
  try {
    const payload = res?.data ?? null;

    // if server returned a string (somehow) try parse
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;

    // If wrapper { success, data } returned:
    if (parsed && typeof parsed === 'object') {
      if ('data' in parsed) return (parsed.data as PublicUser) ?? null;
      // if whole object looks like a user, return it
      // basic heuristic: has username or _id or email
      if ('username' in parsed || '_id' in parsed || 'email' in parsed) return parsed as PublicUser;
    }

    return null;
  } catch (err) {
    dbg('extractUserFromAxiosResponse -> parse error', err);
    return null;
  }
}

function readCachedUser(): PublicUser | null {
  try {
    if (typeof window === 'undefined') {
      dbg('readCachedUser -> no window available');
      return null;
    }
    const raw = sessionStorage.getItem(STORAGE_KEY);
    dbg('readCachedUser -> raw:', raw);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // stored shape is user or null
    return (parsed as PublicUser) ?? null;
  } catch (err) {
    console.warn('[sessionStore] readCachedUser -> failed to read/parse cache', err);
    return null;
  }
}

function writeCachedUser(u: PublicUser | null) {
  try {
    if (typeof window === 'undefined') {
      dbg('writeCachedUser -> no window available');
      return;
    }
    if (u === null) {
      sessionStorage.removeItem(STORAGE_KEY);
      dbg('writeCachedUser -> removed key');
    } else {
      // store user directly (not wrapper)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      dbg('writeCachedUser -> wrote user');
    }
  } catch (err) {
    console.error('[sessionStore] writeCachedUser -> storage error', err);
  }
}

async function fetchUserFromServer(signal?: AbortSignal): Promise<PublicUser | null> {
  dbg('fetchUserFromServer -> starting request to /api/current-user');
  try {
    const res = await axios.get('/api/current-user', { signal });
    dbg('fetchUserFromServer -> axios status', res.status);
    const user = extractUserFromAxiosResponse(res);
    dbg('fetchUserFromServer -> extracted user:', user);
    return user;
  } catch (err: any) {
    // axios abort uses CanceledError with name 'CanceledError'
    dbg('fetchUserFromServer -> error', err?.name ?? err);
    if (err?.name === 'CanceledError' || err?.name === 'AbortError') throw err;
    // treat any non-network success as no-session
    return null;
  }
}

const sessionStore = {
  getSnapshot: () => {
    dbg('getSnapshot -> currentUser (before fallback):', currentUser);
    if (currentUser !== null) return currentUser;
    currentUser = readCachedUser();
    dbg('getSnapshot -> after reading cache currentUser:', currentUser);
    return currentUser;
  },

  subscribe: (cb: Subscriber) => {
    subscribers.add(cb);
    dbg('subscribe -> added subscriber, total:', subscribers.size);
    return () => {
      subscribers.delete(cb);
      dbg('subscribe -> removed subscriber, total:', subscribers.size);
    };
  },

  async fetch(revalidate = false): Promise<PublicUser | null> {
    dbg('fetch -> called (revalidate=' + revalidate + ')', {
      currentUser,
      inFlightFetchExists: !!inFlightFetch,
    });

    // If already have value and not forcing revalidate, return it
    if (currentUser !== null && !revalidate) {
      dbg('fetch -> returning cached currentUser without network');
      return currentUser;
    }

    // Deduplicate in-flight requests
    if (!inFlightFetch) {
      dbg('fetch -> no inFlightFetch, starting one');
      const controller = new AbortController();
      inFlightFetch = (async () => {
        try {
          const u = await fetchUserFromServer(controller.signal);
          dbg('fetch(inFlight) -> server returned user:', u);
          // normalize and set
          currentUser = u;
          writeCachedUser(u);
          emit();
          return u;
        } catch (err) {
          dbg('fetch(inFlight) -> caught error:', (err as any)?.name ?? err);
          // rethrow aborts so callers can decide, otherwise return null
          if ((err as any)?.name === 'CanceledError' || (err as any)?.name === 'AbortError')
            throw err;
          return null;
        } finally {
          dbg('fetch(inFlight) -> clearing inFlightFetch');
          inFlightFetch = null;
        }
      })();
      // expose cancel for consumers if desired
      (inFlightFetch as any).cancel = () => {
        dbg('inFlightFetch.cancel -> aborting controller');
        controller.abort();
      };
    } else {
      dbg('fetch -> returning existing inFlightFetch promise');
    }

    return inFlightFetch;
  },

  setLocal(u: PublicUser | null) {
    dbg('setLocal -> setting user locally to:', u);
    // clone to avoid accidental mutations by callers
    currentUser = u ? JSON.parse(JSON.stringify(u)) : null;
    writeCachedUser(currentUser);
    emit();
  },
};

// Cross-tab sync: listen for session changes in other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    try {
      if (e.key !== STORAGE_KEY) return;
      dbg('storage event -> key:', e.key, 'newValue:', e.newValue);
      currentUser = readCachedUser();
      dbg('storage event -> updated currentUser:', currentUser);
      emit();
    } catch (err) {
      console.error('[sessionStore] storage event -> handler error', err);
    }
  });
}

// Hook
export default function useGetUserSession() {
  const user = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getSnapshot
  );
  dbg('useGetUserSession render -> user:', user);

  const [loading, setLoading] = useState<boolean>(() => user === null);

  useEffect(() => {
    let mounted = true;
    dbg('[useGetUserSession] effect -> mount, user:', user, 'initial loading:', loading);

    if (user !== null) {
      dbg('[useGetUserSession] effect -> user already exists, setLoading(false)');
      setLoading(false);
      return;
    }

    setLoading(true);
    dbg('[useGetUserSession] effect -> fetching session from store');

    sessionStore
      .fetch()
      .then((u) => {
        dbg('[useGetUserSession] effect -> fetch resolved with:', u);
      })
      .catch((err) => {
        dbg('[useGetUserSession] effect -> fetch error (possibly abort):', err?.name ?? err);
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
        if (process.env.NODE_ENV === 'development') console.error('Error fetching session:', err);
      })
      .finally(() => {
        if (mounted) {
          dbg('[useGetUserSession] effect -> setting loading false');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      dbg('[useGetUserSession] effect -> unmount');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revalidate = async () => {
    dbg('[useGetUserSession] revalidate -> start');
    setLoading(true);
    try {
      const u = await sessionStore.fetch(true);
      dbg('[useGetUserSession] revalidate -> fetch result', u);
      return u;
    } finally {
      setLoading(false);
      dbg('[useGetUserSession] revalidate -> loading false');
    }
  };

  const clearSession = () => {
    dbg('[useGetUserSession] clearSession -> clearing session');
    sessionStore.setLocal(null);
  };

  /**
   * Normalize various shapes coming from the session hook:
   * - null
   * - PublicUser object
   * - wrapper { success, data: user }
   * - JSON string of either of the above
   */
  function normalizeUserShape(u: unknown): PublicUser | null {
    if (!u) return null;

    try {
      // If server returned a JSON string, parse it
      if (typeof u === 'string') {
        const parsed = JSON.parse(u);
        return normalizeUserShape(parsed);
      }

      // If wrapper { success, data: user }
      if (typeof u === 'object' && u !== null) {
        const obj = u as any;
        if ('data' in obj && obj.data) return obj.data as PublicUser;
        // If it already looks like a user (heuristic)
        if ('username' in obj || '_id' in obj || 'email' in obj) return obj as PublicUser;
      }
    } catch (err) {
      dbg('normalizeUserShape -> parse error', err);
    }
    return null;
  }
  // user.data => JSON (stringify)
  const userData = normalizeUserShape(user);
  // JSON.parse(user! as any);
  return { userData, loading, revalidate, clearSession } as const;
}

// export for advanced usage
export { sessionStore };
