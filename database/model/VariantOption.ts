import { Model, Relation, Q } from '@nozbe/watermelondb';
import { date, immutableRelation, text, writer } from '@nozbe/watermelondb/decorators';
import type { SyncState } from '../types';
import ProductVariant from './ProductVariant';
import VariantType from './VariantType';

export default class VariantOption extends Model {
  static table = 'variant_options';
  static associations = {
    variant_types: { type: 'belongs_to' as const, key: 'variant_type' },
  };

  @text('variant_type') variantTypeId!: string;
  @text('label') label!: string;
  @text('value') value!: string;
  @text('tenant') tenant!: string | null;
  @text('sync_state') syncState!: SyncState;
  @date('deleted_at') deletedAt!: Date | null;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @immutableRelation('variant_types', 'variant_type')
  variantType!: Relation<VariantType>;

  @writer async markAsSynced() {
    await this.update((record) => {
      record.syncState = 'synced';
      record.updatedAt = new Date();
    });
  }

  @writer async markAsDeleted() {
    const now = new Date();
    const variantsCollection = this.collections.get<ProductVariant>('variants');
    const candidateVariants = await variantsCollection
      .query(Q.where('sync_state', Q.oneOf(['created', 'updated'])))
      .fetch();
    const linkedVariants = candidateVariants.filter((variant) =>
      Array.isArray(variant.options) && variant.options.includes(this.id)
    );

    await this.batch(
      ...linkedVariants.map((variant) =>
        variant.prepareUpdate((record) => {
          record.options = (record.options ?? []).filter((id) => id !== this.id);
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
