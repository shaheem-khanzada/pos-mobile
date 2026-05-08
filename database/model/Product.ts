import { Model, Q, Relation } from '@nozbe/watermelondb';
import { date, field, json, relation, text, writer } from '@nozbe/watermelondb/decorators';
import { SyncState } from '../types';
import { sanitizer } from '../utils';
import Media from './Media';
import ProductVariant from './ProductVariant';

export default class Product extends Model {
  static table = 'products';

  static associations = {
    media: { type: 'belongs_to' as const, key: 'media' },
    variants: { type: 'has_many' as const, foreignKey: 'product_id' },
    order_items: { type: 'has_many' as const, foreignKey: 'product_id' },
  };

  @text('title') title!: string;
  @text('description') description!: string | null;
  @text('barcode') barcode!: string | null;
  @field('inventory') inventory!: number | null;
  @field('enable_variants') enableVariants!: boolean | null;
  @field('price_in_pkr_enabled') priceInPKREnabled!: boolean | null;
  @field('price_in_pkr') priceInPKR!: number | null;
  @field('cost_in_pkr_enabled') costInPKREnabled!: boolean | null;
  @field('cost_in_pkr') costInPKR!: number | null;
  @text('slug') slug!: string;
  @relation('media', 'media') media!: Relation<Media>;
  @json('categories', sanitizer) categories!: string[];
  @json('variant_types', sanitizer) variantTypes!: string[];
  @text('tenant') tenant!: string | null;
  @text('sync_state') syncState!: SyncState;
  @date('deleted_at') deletedAt!: Date | null;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @writer async markAsSynced() {
    await this.update((record) => {
      record.syncState = 'synced';
      record.updatedAt = new Date();
    });
  }

  @writer async markAsDeleted() {
    const variants = await this.collections
      .get<ProductVariant>('variants')
      .query(Q.where('product_id', this.id))
      .fetch();
    await this.batch(
      ...variants.map((variant) => variant.prepareDestroyPermanently()),
      this.prepareDestroyPermanently()
    );
  }
}
