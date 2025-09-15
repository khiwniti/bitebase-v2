import { useState, useEffect, useRef } from "react";

let globalAuthCache: { user: any; isLoading: boolean; lastFetch: number } | null = null;
let authPromise: Promise<any> | null = null;

export function useAuth() {
  const [authState, setAuthState] = useState(() => {
    if (globalAuthCache) {
      return { user: globalAuthCache.user, isLoading: globalAuthCache.isLoading };
    }
    // Start with non-blocking state for faster UI
    return { user: null, isLoading: false };
  });
  
  const hasFetched = useRef(false);

  useEffect(() => {
    // Only fetch if we haven't fetched yet or cache is older than 5 minutes
    const now = Date.now();
    const cacheAge = globalAuthCache ? now - globalAuthCache.lastFetch : Infinity;
    const shouldFetch = !hasFetched.current && (!globalAuthCache || cacheAge > 5 * 60 * 1000);
    
    if (!shouldFetch) {
      if (globalAuthCache) {
        setAuthState({ user: globalAuthCache.user, isLoading: false });
      }
      return;
    }

    hasFetched.current = true;

    // If there's already a request in flight, wait for it
    if (authPromise) {
      authPromise.then((user) => {
        setAuthState({ user, isLoading: false });
      }).catch(() => {
        setAuthState({ user: null, isLoading: false });
      });
      return;
    }

    // Make the request with fast timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
    
    authPromise = fetch("/api/auth/user", { 
      credentials: "include",
      signal: controller.signal
    })
      .then(async (response) => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          return null;
        }
        return await response.json();
      })
      .catch(() => {
        clearTimeout(timeoutId);
        return null;
      })
      .finally(() => {
        authPromise = null;
      });

    authPromise.then((user) => {
      globalAuthCache = {
        user,
        isLoading: false,
        lastFetch: Date.now()
      };
      setAuthState({ user, isLoading: false });
    });
  }, []);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: !!authState.user,
  };
}
