import { syncProductsFromApi } from './products-sync';
import { syncOrdersFromApi } from './orders-sync';

export { syncProductsFromApi, syncOrdersFromApi };
export { useSyncMetaStore } from './sync-meta-store';
export type { CartItem } from '../types';

export async function syncAllFromApi(options?: {
  pageSize?: number;
}) {
  console.info('[db-sync] run start', options ?? {});
  const products = await syncProductsFromApi({ pageSize: options?.pageSize });
  const orders = await syncOrdersFromApi({ pageSize: options?.pageSize });
  const summary = { products, orders };
  console.info('[db-sync] run done', summary);
  return summary;
}
