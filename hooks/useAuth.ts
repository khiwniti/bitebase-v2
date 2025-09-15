import { useState, useEffect, useRef } from "react";

let globalAuthCache: { user: any; isLoading: boolean; lastFetch: number } | null = null;
let authPromise: Promise<any> | null = null;

export function useAuth() {
  const [authState, setAuthState] = useState(() => {
    if (globalAuthCache) {
      return { user: globalAuthCache.user, isLoading: globalAuthCache.isLoading };
    }
    // Start with demo user for faster UI in demo mode
    return { user: {
      id: "demo-user-123",
      email: "demo@bitebase.ai", 
      firstName: "Demo",
      lastName: "User"
    }, isLoading: false };
  });
  
  const hasFetched = useRef(false);

  useEffect(() => {
    // For demo mode, skip auth verification and use demo user
    const demoUser = {
      id: "demo-user-123",
      email: "demo@bitebase.ai", 
      firstName: "Demo",
      lastName: "User"
    };
    
    globalAuthCache = {
      user: demoUser,
      isLoading: false,
      lastFetch: Date.now()
    };
    
    setAuthState({ user: demoUser, isLoading: false });
  }, []);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: !!authState.user,
  };
}
