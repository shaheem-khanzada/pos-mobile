import { Q } from '@nozbe/watermelondb';

import { database } from '../db';
import Order from '../model/Order';
import OrderItem from '../model/OrderItem';
import { extractRemoteCreatedId } from '../utils';
import { createOrderRemote, deleteOrderRemote, updateOrderRemote } from './apis';
import { buildOrderPushData } from './builders';

export async function syncOrdersToApi() {
  const ordersCollection = database.get<Order>('orders');

  const createdOrders = await ordersCollection
    .query(Q.where('sync_state', 'created'))
    .fetch();
  const updatedOrders = await ordersCollection
    .query(Q.where('sync_state', 'updated'))
    .fetch();
  const deletedOrders = await ordersCollection
    .query(Q.where('sync_state', 'deleted'))
    .fetch();

  let pushed = 0;
  let deletedLocal = 0;
  let failed = 0;

  console.info('[db-push][orders] start', {
    created: createdOrders.length,
    updated: updatedOrders.length,
    deleted: deletedOrders.length,
  });

  for (const order of createdOrders) {
    try {
      const items = await order.items.fetch();
      const response = await createOrderRemote({
        id: order.id,
        ...buildOrderPushData(order, items as OrderItem[]),
      });
      const remoteId = extractRemoteCreatedId(response);
      if (!remoteId) {
        throw new Error('[db-push][orders] missing remote id after create');
      }
      if (remoteId !== order.id) {
        throw new Error(
          `[db-push][orders] remote id mismatch after create: remote=${remoteId} local=${order.id}`
        );
      }
      await order.markAsSynced();
      pushed += 1;
    } catch {
      failed += 1;
    }
  }

  for (const order of updatedOrders) {
    try {
      const items = await order.items.fetch();
      await updateOrderRemote(order.id, buildOrderPushData(order, items as OrderItem[]));
      await order.markAsSynced();
      pushed += 1;
    } catch {
      failed += 1;
    }
  }

  for (const order of deletedOrders) {
    try {
      await deleteOrderRemote(order.id);
      await order.markAsDeleted();
      deletedLocal += 1;
    } catch {
      failed += 1;
    }
  }

  const result = { pushed, deletedLocal, failed };
  console.info('[db-push][orders] done', result);
  return result;
}
