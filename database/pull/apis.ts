import { payloadSdk } from '@/payload/sdk';
import type {
  Cart,
  Category,
  Media,
  Product as PayloadProduct,
  Variant as PayloadVariant,
  VariantOption,
  VariantType,
} from '../types';
import { normalizeVariants } from '../utils';

/** GET `/api/analytics` — shape matches backend. */
export type AnalyticsApiResponse = {
  success?: boolean;
  data: {
    daily: unknown;
    last30Days: unknown;
    last7Days: unknown;
    today: unknown;
    topProducts30d: unknown;
  };
};

export async function fetchAnalytics(): Promise<AnalyticsApiResponse> {
  const res = await payloadSdk.request({
    method: 'GET',
    path: '/analytics',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Analytics request failed: ${res.status} ${text}`);
  }
  return (await res.json()) as AnalyticsApiResponse;
}

export async function fetchOrders(params: {
  page: number;
  pageSize: number;
  cursor?: string | null;
}) {
  const { page, pageSize, cursor } = params;
  const res = await payloadSdk.find({
    collection: 'carts',
    trash: true,
    depth: 2,
    page,
    limit: pageSize,
    sort: ['updatedAt', 'id'],
    where: cursor
      ? {
          updatedAt: {
            greater_than_equal: cursor,
          },
        }
      : undefined,
  });

  return {
    docs: (res.docs ?? []) as Cart[],
    hasNext: Boolean(res.nextPage),
  };
}

type ProductDoc = PayloadProduct & { variants?: PayloadVariant[] };
type ProductListResponse = {
  docs?: PayloadProduct[];
  nextPage?: number | null;
};

export async function fetchProducts(params: {
  page: number;
  pageSize: number;
  cursor?: string | null;
}) {
  const { page, pageSize, cursor } = params;
  const res = (await payloadSdk.find({
    collection: 'products',
    trash: true,
    depth: 1,
    page,
    limit: pageSize,
    sort: ['updatedAt', 'id'],
    where: cursor
      ? {
          updatedAt: {
            greater_than_equal: cursor,
          },
        }
      : undefined,
  })) as ProductListResponse;

  const docs = (res.docs ?? []).map((doc) => ({
    ...doc,
    variants: normalizeVariants(doc),
  })) as ProductDoc[];

  return {
    docs,
    hasNext: Boolean(res.nextPage),
  };
}

export async function fetchCategories(params: {
  page: number;
  pageSize: number;
  cursor?: string | null;
}) {
  const { page, pageSize, cursor } = params;
  const res = await payloadSdk.find({
    collection: 'categories',
    trash: true,
    depth: 0,
    page,
    limit: pageSize,
    sort: ['updatedAt', 'id'],
    where: cursor
      ? {
          updatedAt: {
            greater_than_equal: cursor,
          },
        }
      : undefined,
  });

  return {
    docs: (res.docs ?? []) as (Category & { deletedAt?: string | null })[],
    hasNext: Boolean(res.nextPage),
  };
}

export async function fetchVariantTypes(params: {
  page: number;
  pageSize: number;
  cursor?: string | null;
}) {
  const { page, pageSize, cursor } = params;
  const res = await payloadSdk.find({
    collection: 'variantTypes',
    trash: true,
    depth: 0,
    page,
    limit: pageSize,
    sort: ['updatedAt', 'id'],
    where: cursor
      ? {
          updatedAt: {
            greater_than_equal: cursor,
          },
        }
      : undefined,
  });

  return {
    docs: (res.docs ?? []) as (VariantType & { deletedAt?: string | null })[],
    hasNext: Boolean(res.nextPage),
  };
}

export async function fetchVariantOptions(params: {
  page: number;
  pageSize: number;
  cursor?: string | null;
}) {
  const { page, pageSize, cursor } = params;
  const res = await payloadSdk.find({
    collection: 'variantOptions',
    trash: true,
    depth: 0,
    page,
    limit: pageSize,
    sort: ['updatedAt', 'id'],
    where: cursor
      ? {
          updatedAt: {
            greater_than_equal: cursor,
          },
        }
      : undefined,
  });

  return {
    docs: (res.docs ?? []) as (VariantOption & {
      deletedAt?: string | null;
      variantType?: string | { id: string };
    })[],
    hasNext: Boolean(res.nextPage),
  };
}

export async function fetchMedia(params: {
  page: number;
  pageSize: number;
  cursor?: string | null;
}) {
  const { page, pageSize, cursor } = params;
  const res = await payloadSdk.find({
    collection: 'media',
    trash: true,
    depth: 0,
    page,
    limit: pageSize,
    sort: ['updatedAt', 'id'],
    where: cursor
      ? {
          updatedAt: {
            greater_than_equal: cursor,
          },
        }
      : undefined,
  });

  return {
    docs: (res.docs ?? []) as (Media & { deletedAt?: string | null })[],
    hasNext: Boolean(res.nextPage),
  };
}
