import { payloadSdk } from '@/payload/sdk';
import type { Cart, Product as PayloadProduct, Variant as PayloadVariant } from '../types';
import { normalizeVariants } from '../utils';

export async function fetchOrders(params: {
  page: number;
  pageSize: number;
  cursor?: string | null;
}) {
  const { page, pageSize, cursor } = params;
  const res = await payloadSdk.find({
    collection: 'carts',
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
