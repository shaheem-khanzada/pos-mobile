import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AuthUser } from '@/api/auth/types';

/**
 * Everything we need after a successful login (or password reset that returns a new JWT).
 * Lives in Zustand + AsyncStorage so a cold start can restore the session without hitting the API.
 */
type AuthSessionPayload = {
  token: string;
  user: AuthUser;
  exp?: number | null;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  exp: number | null;
  setSession: (session: AuthSessionPayload) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      exp: null,
      setSession: ({ token, user, exp }) =>
        set({
          token,
          user,
          exp: exp ?? null,
        }),
      clearSession: () =>
        set({
          token: null,
          user: null,
          exp: null,
        }),
    }),
    {
      name: 'pos-auth-session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        exp: state.exp,
      }),
    }
  )
);
