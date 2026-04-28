import { Model } from '@nozbe/watermelondb';
import {
  date,
  field,
  immutableRelation,
  relation,
} from '@nozbe/watermelondb/decorators';

import Order from './Order';
import Product from './Product';
import ProductVariant from './ProductVariant';

export default class OrderItem extends Model {
  static table = 'order_items';

  static associations = {
    orders: { type: 'belongs_to' as const, key: 'order_id' },
    products: { type: 'belongs_to' as const, key: 'product_id' },
    variants: { type: 'belongs_to' as const, key: 'variant_id' },
  };

  @field('quantity') quantity!: number;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @immutableRelation('orders', 'order_id') order!: Order;
  @immutableRelation('products', 'product_id') product!: Product;
  @relation('variants', 'variant_id') variant!: ProductVariant | null;
}
