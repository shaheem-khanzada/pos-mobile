import { Model, Query } from '@nozbe/watermelondb';
import { children, date, field, text, writer } from '@nozbe/watermelondb/decorators';

import type { Cart, SyncState } from '../types';
import OrderItem from './OrderItem';

export default class Order extends Model {
  static table = 'orders';

  static associations = {
    order_items: { type: 'has_many' as const, foreignKey: 'order_id' },
  };

  @text('status') status!: NonNullable<Cart['status']> | string;
  @text('payment_method') paymentMethod!: Cart['paymentMethod'];
  @text('customer_name') customerName!: string;
  @text('customer_phone') customerPhone!: string | null;
  @text('currency') currency!: Cart['currency'] | string | null;
  @field('subtotal') subtotal!: number | null;
  @field('discount') discount!: number | null;
  @field('cogs_total') cogsTotal!: number | null;
  @field('gross_profit') grossProfit!: number | null;
  @text('tenant') tenant!: string | null;
  @text('sync_state') syncState!: SyncState;
  @date('purchased_at') purchasedAt!: Date | null;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @children('order_items') items!: Query<OrderItem>;

  @writer async markAsSynced() {
    await this.update((record) => {
      record.syncState = 'synced';
      record.updatedAt = new Date();
    });
  }
}
