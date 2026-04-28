import { Q } from '@nozbe/watermelondb';

import { database } from '../db';
import Order from '../model/Order';
import OrderItem from '../model/OrderItem';
import { createOrderRemote, deleteOrderRemote, updateOrderRemote } from './apis';
import { buildOrderPushData } from './builders';

export async function syncOrdersToApi() {
  const ordersCollection = database.get<Order>('orders');
  const orderItemsCollection = database.get<OrderItem>('order_items');

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
      await createOrderRemote(order.id, buildOrderPushData(order, items as OrderItem[]));
      await database.write(async () => {
        await database.batch(
          order.prepareUpdate((row) => {
            row.syncState = 'synced';
            row.updatedAt = new Date();
          })
        );
      });
      pushed += 1;
    } catch {
      failed += 1;
    }
  }

  for (const order of updatedOrders) {
    try {
      const items = await order.items.fetch();
      await updateOrderRemote(order.id, buildOrderPushData(order, items as OrderItem[]));
      await database.write(async () => {
        await database.batch(
          order.prepareUpdate((row) => {
            row.syncState = 'synced';
            row.updatedAt = new Date();
          })
        );
      });
      pushed += 1;
    } catch {
      failed += 1;
    }
  }

  for (const order of deletedOrders) {
    try {
      await deleteOrderRemote(order.id);
      const localItems = await orderItemsCollection
        .query(Q.where('order_id', order.id))
        .fetch();
      await database.write(async () => {
        await database.batch(
          ...localItems.map((item) => item.prepareDestroyPermanently()),
          order.prepareDestroyPermanently()
        );
      });
      deletedLocal += 1;
    } catch {
      failed += 1;
    }
  }

  const result = { pushed, deletedLocal, failed };
  console.info('[db-push][orders] done', result);
  return result;
}
