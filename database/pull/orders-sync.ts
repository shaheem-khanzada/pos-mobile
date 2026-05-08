import { Q } from '@nozbe/watermelondb';
import { sanitizedRaw } from '@nozbe/watermelondb/RawRecord';

import { buildOrder } from '../builder';
import { database } from '../db';
import Order from '../model/Order';
import OrderItem from '../model/OrderItem';
import type { Cart } from '../types';
import { isSoftDeleted, extractId } from '../utils';
import { fetchOrders } from './apis';
import { getLastFetchOrders, setLastFetchOrders } from './sync-meta-store';

export async function syncOrdersFromApi(options?: { pageSize?: number }) {
  const pageSize = options?.pageSize ?? 100;
  const ordersCollection = database.get<Order>('orders');
  const orderItemsCollection = database.get<OrderItem>('order_items');
  const lastFetchedOrders = getLastFetchOrders();
  const runCursor = lastFetchedOrders;

  let page = 1;
  let hasNext = true;
  let deleted = 0;
  let upserted = 0;
  let checkpointCursor = lastFetchedOrders;

  console.info('[db-sync][orders] start', {
    pageSize,
    runCursor,
  });

  while (hasNext) {
    // 1) Pull one page from API
    const { docs: pageDocs, hasNext: nextPage } = await fetchOrders({
      page,
      pageSize,
      cursor: runCursor,
    });

    const deletedDocs = pageDocs.filter(isSoftDeleted);
    const activeDocs = pageDocs.filter((doc) => !isSoftDeleted(doc));
    const pageOperations: any[] = [];

    // 2) Build delete operations (items first, then orders)
    const deletedIds = deletedDocs.map((doc) => doc.id);
    const localOrdersToDelete = await ordersCollection.query(Q.where('id', Q.oneOf(deletedIds))).fetch();
    const orderIds = localOrdersToDelete.map((order) => order.id);

    const localItemsToDelete = await orderItemsCollection
      .query(Q.where('order_id', Q.oneOf(orderIds)))
      .fetch();

    const deleteItemOps = localItemsToDelete.map((item) =>
      item.prepareDestroyPermanently()
    );
    const deleteOrderOps = localOrdersToDelete.map((order) =>
      order.prepareDestroyPermanently()
    );

    pageOperations.push(...deleteItemOps, ...deleteOrderOps);
    deleted += localOrdersToDelete.length;

    // 3) Build create/update operations for active docs
    const activeIds = activeDocs.map((doc) => doc.id);

    const localActiveOrders = (await ordersCollection
      .query(Q.where('id', Q.oneOf(activeIds)))
      .fetch());

    const localById = new Map(localActiveOrders.map((order) => [order.id, order]));
    const ordersToUpdate = activeDocs.filter((doc) => localById.has(doc.id));
    const ordersToCreate = activeDocs.filter((doc) => !localById.has(doc.id));

    const existingLineItemsForPage =
      activeIds.length > 0
        ? await orderItemsCollection.query(Q.where('order_id', Q.oneOf(activeIds))).fetch()
        : [];
    const deleteLineOps = existingLineItemsForPage.map((item) =>
      item.prepareDestroyPermanently()
    );

    const now = Date.now();
    const createLineOps = activeDocs.flatMap((doc: Cart) =>
      (doc.items ?? []).flatMap((item) => {
        const productId = extractId(item.product as string | { id: string });
        if (!productId) return [];
        const variantId = item.variant ? extractId(item.variant as string | { id: string }) : null;
        return [
          orderItemsCollection.prepareCreate((record) => {
            record._raw = sanitizedRaw(
              {
                id: item.id,
                order_id: doc.id,
                product_id: productId,
                variant_id: variantId,
                quantity: item.quantity,
                unit_price_in_pkr: item.unitPriceInPKR ?? null,
                unit_cost_in_pkr: item.unitCostInPKR ?? null,
                created_at: now,
                updated_at: now,
              },
              orderItemsCollection.schema
            );
          }),
        ];
      })
    );

    const createOps = ordersToCreate.map((doc) => {
      const fields = buildOrder(doc);
      return ordersCollection.prepareCreate((row) => {
        row._raw = sanitizedRaw({ id: doc.id }, ordersCollection.schema);
        Object.assign(row, fields);
      });
    });

    const updateOps = ordersToUpdate.map((doc) => {
      const localOrder = localById.get(doc.id)!;
      const fields = buildOrder(doc);
      return localOrder.prepareUpdate((row) => {
        Object.assign(row, fields);
      });
    });

    pageOperations.push(...deleteLineOps);
    pageOperations.push(...createOps, ...updateOps);
    pageOperations.push(...createLineOps);
    upserted += activeDocs.length;


    // 4) Commit this page in one batch
    if (pageOperations.length > 0) {
      await database.write(async () => {
        await database.batch(...pageOperations);
      });
    }

    // Advance cursor progressively so retry resumes near the failure point.
    const pageUpdatedAt = pageDocs
      .map((doc) => Date.parse(doc.updatedAt))
      .filter((ms) => Number.isFinite(ms))
      .sort((a, b) => b - a)[0];
    if (pageUpdatedAt != null) {
      checkpointCursor = new Date(pageUpdatedAt).toISOString();
      setLastFetchOrders(checkpointCursor);
    }

    console.info('[db-sync][orders] page', {
      page,
      fetched: pageDocs.length,
      active: activeDocs.length,
      deleted: deletedDocs.length,
      upsertedTotal: upserted,
      deletedTotal: deleted,
      checkpointCursor,
      hasNext: nextPage,
    });

    // 5) Go to next page if server has more
    hasNext = nextPage;
    page += 1;
  }

  if (!checkpointCursor) {
    setLastFetchOrders(new Date().toISOString());
  }

  console.info('[db-sync][orders] done', {
    upserted,
    deleted,
    checkpointCursor,
  });

  return { upserted, deleted };
}
