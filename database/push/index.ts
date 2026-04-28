import { syncOrdersToApi } from './orders-sync';
import { syncProductsToApi } from './products-sync';

export { syncProductsToApi, syncOrdersToApi };

export async function syncAllToApi() {
  console.info('[db-push] run start');
  const products = await syncProductsToApi();
  const orders = await syncOrdersToApi();
  const summary = { products, orders };
  console.info('[db-push] run done', summary);
  const failedCount = (products.failed ?? 0) + (orders.failed ?? 0);
  if (failedCount > 0) {
    throw new Error(`[db-push] failed for ${failedCount} records`);
  }
  return summary;
}
