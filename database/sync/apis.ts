import { payloadSdk } from '@/payload/sdk';
import type { Cart, Product } from '../types';
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
  }));

  const docs = (res.docs ?? []).map((doc) => ({
    ...doc,
    variants: normalizeVariants(doc),
  })) as Product[];

  return {
    docs,
    hasNext: Boolean(res.nextPage),
  };
}
