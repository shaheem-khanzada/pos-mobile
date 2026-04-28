import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { syncAllFromApi } from '@/database';
import { useAuthStore } from '@/screens/auth/stores/auth-store';

type UseDatabaseSyncOptions = {
  pageSize?: number;
  resumeThrottleMs?: number;
};

export function useDatabaseSync(options?: UseDatabaseSyncOptions) {
  const token = useAuthStore((s) => s.token);
  const tenantId = useAuthStore((s) => s.tenantId);

  const pageSize = options?.pageSize ?? 100;
  const resumeThrottleMs = options?.resumeThrottleMs ?? 2 * 60 * 1000;

  const inFlightRef = useRef(false);
  const lastRunAtRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!token || !tenantId) return;

    const runSync = async (reason: 'startup' | 'resume') => {
      if (inFlightRef.current) return;
      const now = Date.now();
      if (reason === 'resume' && now - lastRunAtRef.current < resumeThrottleMs) {
        return;
      }

      try {
        inFlightRef.current = true;
        console.info('[db-sync] trigger', { reason, pageSize });
        await syncAllFromApi({ pageSize });
        lastRunAtRef.current = Date.now();
      } catch (error) {
        console.error('[db-sync] failed', { reason, error });
      } finally {
        inFlightRef.current = false;
      }
    };

    void runSync('startup');

    const sub = AppState.addEventListener('change', (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;
      if ((prev === 'background' || prev === 'inactive') && nextState === 'active') {
        void runSync('resume');
      }
    });

    return () => {
      sub.remove();
    };
  }, [token, tenantId, pageSize, resumeThrottleMs]);
}
