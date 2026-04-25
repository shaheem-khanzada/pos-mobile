import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { User } from '@/payload/types';


type AuthSession= {
  token: string;
  user: User;
  exp?: number | null;
};

type AuthState = {
  token: string | null;
  user: User | null;
  exp: number | null;
  tenantId: string | null;
  setSession: (session: AuthSession) => void;
  setTenantId: (tenantId: string | null) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      exp: null,
      tenantId: null,
      setSession: ({ token, user, exp }) =>
        set({
          token,
          user: user,
          exp: exp ?? null,
        }),
      setTenantId: (tenantId) => set({ tenantId }),
      clearSession: () =>
        set({
          token: null,
          user: null,
          exp: null,
          tenantId: null,
        }),
    }),
    {
      name: 'pos-auth-session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        exp: state.exp,
        tenantId: state.tenantId,
      }),
    }
  )
);
