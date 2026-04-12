import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuthStore } from '@/stores/auth-store';

/**
 * Thin auth gate for routing: we only expose "storage finished rehydrating"
 * and "do we have a JWT". Token and user profile live in Zustand, not here.
 */
type AuthContextValue = {
  isReady: boolean;
  isSignedIn: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(() =>
    useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsReady(true);
    });
    if (useAuthStore.persist.hasHydrated()) {
      setIsReady(true);
    }
    return unsub;
  }, []);

  const token = useAuthStore((s) => s.token);
  const isSignedIn = Boolean(token);

  const value = useMemo(
    () => ({ isReady, isSignedIn }),
    [isReady, isSignedIn]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
