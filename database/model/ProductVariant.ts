import { Model } from '@nozbe/watermelondb';
import { date, field, immutableRelation, text } from '@nozbe/watermelondb/decorators';
import type { SyncState } from '../types';

import Product from './Product';

export default class ProductVariant extends Model {
  static table = 'variants';

  static associations = {
    products: { type: 'belongs_to' as const, key: 'product_id' },
    order_items: { type: 'has_many' as const, foreignKey: 'variant_id' },
  };

  @text('title') title!: string | null;
  @text('barcode') barcode!: string | null;
  @field('inventory') inventory!: number | null;
  @field('price_in_pkr_enabled') priceInPKREnabled!: boolean | null;
  @field('price_in_pkr') priceInPKR!: number | null;
  @text('options_json') optionsJson!: string | null;
  @text('tenant') tenant!: string | null;
  @text('sync_state') syncState!: SyncState;
  @date('deleted_at') deletedAt!: Date | null;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @immutableRelation('products', 'product_id') product!: Product;
}
