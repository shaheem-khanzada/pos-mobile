import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { User } from '@/payload/types';

/** Payload `users.tenants[]` is often `{ id: junctionId, tenant: { id, name } }`. */
type UserTenantRow = {
  id: string;
  name?: string;
  tenant?: { id?: string; name?: string };
};

function tenantIdFromUserTenantRow(row: UserTenantRow): string | undefined {
  const nestedId = row.tenant?.id;
  if (nestedId) return nestedId;
  return row.id;
}

function tenantNameFromUserTenantRow(row: UserTenantRow): string | undefined {
  const nested = row.tenant?.name?.trim();
  if (nested) return nested;
  return row.name?.trim();
}


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

export const getSelectedTenantId = () => {
  const tenantId = useAuthStore.getState().tenantId;
  if (!tenantId) {
    throw new Error('Tenant ID is not set');
  }
  return tenantId;
};

/** Header name for receipts — matches selected tenant when available. */
export function getReceiptStoreDisplayName(): string {
  const { user, tenantId } = useAuthStore.getState();
  const fallback = 'Store';
  const rows = (user?.tenants ?? []) as UserTenantRow[];
  if (!rows.length) return fallback;

  if (tenantId) {
    const match = rows.find((r) => tenantIdFromUserTenantRow(r) === tenantId);
    const name = match ? tenantNameFromUserTenantRow(match) : undefined;
    if (name) return name;
  }

  const first = tenantNameFromUserTenantRow(rows[0]);
  return first || fallback;
}
