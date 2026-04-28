import { Model } from '@nozbe/watermelondb';
import { children, date, field, text } from '@nozbe/watermelondb/decorators';

import type { Cart } from '../types';

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
  @date('purchased_at') purchasedAt!: Date | null;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @children('order_items') items!: any;
}
