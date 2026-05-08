import { Model, Q, Query } from '@nozbe/watermelondb';
import { children, date, text, writer } from '@nozbe/watermelondb/decorators';
import type { SyncState } from '../types';
import Product from './Product';
import VariantOption from './VariantOption';

export default class VariantType extends Model {
  static table = 'variant_types';

  static associations = {
    variant_options: { type: 'has_many' as const, foreignKey: 'variant_type' },
  };

  @text('label') label!: string;
  @text('name') name!: string;
  @text('tenant') tenant!: string | null;
  @text('sync_state') syncState!: SyncState;
  @date('deleted_at') deletedAt!: Date | null;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @children('variant_options') variantOptions!: Query<VariantOption>;

  @writer async markAsSynced() {
    await this.update((record) => {
      record.syncState = 'synced';
      record.updatedAt = new Date();
    });
  }

  @writer async markAsDeleted() {
    const now = new Date();
    const productsCollection = this.collections.get<Product>('products');
    const candidateProducts = await productsCollection
      .query(Q.where('sync_state', Q.oneOf(['created', 'updated'])))
      .fetch();
    const linkedProducts = candidateProducts.filter((product) =>
      Array.isArray(product.variantTypes) && product.variantTypes.includes(this.id)
    );

    await this.batch(
      ...linkedProducts.map((product) =>
        product.prepareUpdate((record) => {
          record.variantTypes = (record.variantTypes ?? []).filter((id) => id !== this.id);
          if (record.syncState !== 'created' && record.syncState !== 'deleted') {
            record.syncState = 'updated';
          }
          record.updatedAt = now;
        })
      ),
      this.prepareDestroyPermanently()
    );
  }

}
