import { syncProductsFromApi } from './products-sync';
import { syncOrdersFromApi } from './orders-sync';
import { syncCatalogFromApi } from './catalog-sync';
import { syncReportsFromApi } from './report-sync';

export { syncProductsFromApi, syncOrdersFromApi, syncCatalogFromApi, syncReportsFromApi };
export { useSyncMetaStore } from './sync-meta-store';
export type { CartItem } from '../types';

export async function syncAllFromApi(options?: {
  pageSize?: number;
}) {
  console.info('[db-sync] run start', options ?? {});
  const catalog = await syncCatalogFromApi({ pageSize: options?.pageSize });
  const products = await syncProductsFromApi({ pageSize: options?.pageSize });
  const orders = await syncOrdersFromApi({ pageSize: options?.pageSize });
  let reports: Awaited<ReturnType<typeof syncReportsFromApi>> | null = null;
  try {
    reports = await syncReportsFromApi();
  } catch (error) {
    console.warn('[db-sync] reports pull skipped', error);
  }
  const summary = { catalog, products, orders, reports };
  console.info('[db-sync] run done', summary);
  return summary;
}
