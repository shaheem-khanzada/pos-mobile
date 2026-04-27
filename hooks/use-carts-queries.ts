import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { payloadSdk } from '@/payload/sdk';
import { Cart } from '@/payload/types';

function localCalendarDayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfLocalDayIso(d = new Date()): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

/**
 * Server-side count: `carts` with `status: active` and `createdAt` on or after local midnight today.
 * Uses Payload SDK `count` → `{ totalDocs }`.
 */
export function useActiveCartsTodayCountQuery() {
  const dayKey = localCalendarDayKey();
  return useQuery({
    queryKey: ['carts', 'count', 'active-created-today', dayKey],
    queryFn: async () => {
      const { totalDocs } = await payloadSdk.count({
        collection: 'carts',
        where: {
          and: [
            { createdAt: { greater_than_equal: startOfLocalDayIso() } },
          ],
        },
      });
      return totalDocs;
    },
  });
}

/** Infinite list of `carts`; each page’s `docs` are normalized to `Cart` in `queryFn`. */
export function useCartsListQuery(params?: { limit?: number; sort?: string }) {
  const limit = params?.limit ?? 100;
  return useInfiniteQuery({
    queryKey: ['carts', { limit, sort: params?.sort }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = await payloadSdk.find({
        collection: 'carts',
        page: pageParam,
        limit,
        sort: params?.sort ?? '-createdAt',
        depth: 1,
      });
      return {
        ...page,
        docs: page.docs,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    select: (data) => data.pages.flatMap((page) => page.docs ?? []) as Cart[],
  });
}
