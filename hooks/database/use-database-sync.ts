import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { syncAllFromApi, syncAllToApi } from '@/database';
import { useAuthStore } from '@/screens/auth/stores/auth-store';

type UseDatabaseSyncOptions = {
  pageSize?: number;
  resumeThrottleMs?: number;
};

type SyncTrigger = 'startup' | 'resume';

export function useDatabaseSync(options?: UseDatabaseSyncOptions) {
  const authToken = useAuthStore((state) => state.token);
  const currentTenantId = useAuthStore((state) => state.tenantId);

  const syncPageSize = options?.pageSize ?? 100;
  const resumeSyncThrottleMs = options?.resumeThrottleMs ?? 2 * 60 * 1000;

  const isSyncInFlightRef = useRef(false);
  const lastSuccessfulSyncAtMsRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!authToken || !currentTenantId) return;

    const runPushThenPullSync = async (trigger: SyncTrigger) => {
      if (isSyncInFlightRef.current) return;

      const nowMs = Date.now();
      const isResumeTrigger = trigger === 'resume';
      if (
        isResumeTrigger &&
        nowMs - lastSuccessfulSyncAtMsRef.current < resumeSyncThrottleMs
      ) {
        return;
      }

      try {
        isSyncInFlightRef.current = true;
        console.info('[db-sync] trigger', {
          trigger,
          pageSize: syncPageSize,
          flow: 'push-then-pull',
        });
        await syncAllToApi();
        await syncAllFromApi({ pageSize: syncPageSize });
        lastSuccessfulSyncAtMsRef.current = Date.now();
      } catch (error) {
        console.error('[db-sync] aborted', {
          trigger,
          error,
          message: 'Push failed, skipped pull to avoid reconciliation issues.',
        });
      } finally {
        isSyncInFlightRef.current = false;
      }
    };

    runPushThenPullSync('startup');

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;
      if (
        (previousState === 'background' || previousState === 'inactive') &&
        nextState === 'active'
      ) {
        runPushThenPullSync('resume');
      }
    });

    return () => {
      appStateSubscription.remove();
    };
  }, [authToken, currentTenantId, syncPageSize, resumeSyncThrottleMs]);
}
