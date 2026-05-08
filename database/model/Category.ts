import { Model, Q } from '@nozbe/watermelondb';
import { date, text, writer } from '@nozbe/watermelondb/decorators';
import type { SyncState } from '../types';
import { nextSyncState } from '../utils';
import Product from './Product';

export default class Category extends Model {
  static table = 'categories';

  @text('title') title!: string;
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
    const now = new Date();
    const productsCollection = this.collections.get<Product>('products');
    const candidateProducts = await productsCollection
      .query(Q.where('sync_state', Q.oneOf(['created', 'updated'])))
      .fetch();
    const linkedProducts = candidateProducts.filter((product) =>
      Array.isArray(product.categories) && product.categories.includes(this.id)
    );

    await this.batch(
      ...linkedProducts.map((product) =>
        product.prepareUpdate((record) => {
          record.categories = (record.categories ?? []).filter((id) => id !== this.id);
          record.syncState = nextSyncState(record.syncState);
          record.updatedAt = now;
        })
      ),
      this.prepareDestroyPermanently()
    );
  }

}
