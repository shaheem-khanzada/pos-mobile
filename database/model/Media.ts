import { Model, Q } from '@nozbe/watermelondb';
import { date, text, writer } from '@nozbe/watermelondb/decorators';
import type { SyncState } from '../types';
import Product from './Product';
import { nextSyncState } from '../utils';

export default class Media extends Model {
  static table = 'media';

  @text('alt') alt!: string;
  @text('url') url!: string;
  @text('file_name') fileName!: string | null;
  @text('mime_type') mimeType!: string | null;
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

  /** Reconcile remote-assigned URL and mark synced in a single writer. */
  @writer async markCreatedSynced(remoteUrl?: string | null) {
    await this.update((record) => {
      if (remoteUrl && remoteUrl !== record.url) {
        record.url = remoteUrl;
      }
      record.syncState = 'synced';
      record.updatedAt = new Date();
    });
  }

  @writer async markAsDeleted() {
    const now = new Date();
    const productsCollection = this.collections.get<Product>('products');
    const linkedProducts = await productsCollection.query(Q.where('media', this.id)).fetch();

    await this.batch(
      ...linkedProducts.map((product) =>
        product.prepareUpdate((record) => {
          record.media.id = null;
          record.syncState = nextSyncState(record.syncState);
          record.updatedAt = now;
        })
      ),
      this.prepareDestroyPermanently()
    );
  }

}
