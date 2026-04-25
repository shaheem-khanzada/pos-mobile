import { useEffect, useState } from 'react';

import { useAuthStore } from '@/screens/auth/stores/auth-store';

/**
 * Routing helpers on top of Zustand persist: wait until AsyncStorage has been
 * merged (`isReady`), then treat a stored JWT as signed in.
 */
export function useAuth() {
  const [isReady, setIsReady] = useState(() =>
    useAuthStore.persist.hasHydrated()
  );
  const token = useAuthStore((s) => s.token);
  const isSignedIn = Boolean(token);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsReady(true);
    });
    if (useAuthStore.persist.hasHydrated()) {
      setIsReady(true);
    }
    return unsub;
  }, []);

  return { isReady, isSignedIn };
}
