import { Q } from '@nozbe/watermelondb';

import { database } from '../db';
import Product from '../model/Product';
import ProductVariant from '../model/ProductVariant';
import {
  createProductRemote,
  createVariantRemote,
  deleteProductRemote,
  deleteVariantRemote,
  updateProductRemote,
  updateVariantRemote,
} from './apis';
import { buildProductPushData, buildVariantPushData } from './builders';

export async function syncProductsToApi() {
  const productsCollection = database.get<Product>('products');
  const variantsCollection = database.get<ProductVariant>('variants');

  const createdProducts = await productsCollection
    .query(Q.where('sync_state', 'created'))
    .fetch();
  const updatedProducts = await productsCollection
    .query(Q.where('sync_state', 'updated'))
    .fetch();
  const deletedProducts = await productsCollection
    .query(Q.where('sync_state', 'deleted'))
    .fetch();

  const createdVariants = await variantsCollection
    .query(Q.where('sync_state', 'created'))
    .fetch();
  const updatedVariants = await variantsCollection
    .query(Q.where('sync_state', 'updated'))
    .fetch();
  const deletedVariants = await variantsCollection
    .query(Q.where('sync_state', 'deleted'))
    .fetch();

  let pushedProducts = 0;
  let pushedVariants = 0;
  let deletedLocalProducts = 0;
  let deletedLocalVariants = 0;
  let failed = 0;

  console.info('[db-push][products] start', {
    createdProducts: createdProducts.length,
    updatedProducts: updatedProducts.length,
    deletedProducts: deletedProducts.length,
    createdVariants: createdVariants.length,
    updatedVariants: updatedVariants.length,
    deletedVariants: deletedVariants.length,
  });

  for (const product of createdProducts) {
    try {
      await createProductRemote(product.id, buildProductPushData(product));
      await database.write(async () => {
        await database.batch(
          product.prepareUpdate((row) => {
            row.syncState = 'synced';
            row.updatedAt = new Date();
          })
        );
      });
      pushedProducts += 1;
    } catch {
      failed += 1;
    }
  }

  for (const product of updatedProducts) {
    try {
      await updateProductRemote(product.id, buildProductPushData(product));
      await database.write(async () => {
        await database.batch(
          product.prepareUpdate((row) => {
            row.syncState = 'synced';
            row.updatedAt = new Date();
          })
        );
      });
      pushedProducts += 1;
    } catch {
      failed += 1;
    }
  }

  for (const variant of createdVariants) {
    try {
      await createVariantRemote(variant.id, buildVariantPushData(variant));
      await database.write(async () => {
        await database.batch(
          variant.prepareUpdate((row) => {
            row.syncState = 'synced';
            row.updatedAt = new Date();
          })
        );
      });
      pushedVariants += 1;
    } catch {
      failed += 1;
    }
  }

  for (const variant of updatedVariants) {
    try {
      await updateVariantRemote(variant.id, buildVariantPushData(variant));
      await database.write(async () => {
        await database.batch(
          variant.prepareUpdate((row) => {
            row.syncState = 'synced';
            row.updatedAt = new Date();
          })
        );
      });
      pushedVariants += 1;
    } catch {
      failed += 1;
    }
  }

  for (const variant of deletedVariants) {
    try {
      await deleteVariantRemote(variant.id);
      await database.write(async () => {
        await database.batch(variant.prepareDestroyPermanently());
      });
      deletedLocalVariants += 1;
    } catch {
      failed += 1;
    }
  }

  for (const product of deletedProducts) {
    try {
      await deleteProductRemote(product.id);
      const localVariants = await variantsCollection
        .query(Q.where('product_id', product.id))
        .fetch();
      await database.write(async () => {
        await database.batch(
          ...localVariants.map((variant) => variant.prepareDestroyPermanently()),
          product.prepareDestroyPermanently()
        );
      });
      deletedLocalProducts += 1;
    } catch {
      failed += 1;
    }
  }

  const result = {
    pushedProducts,
    pushedVariants,
    deletedLocalProducts,
    deletedLocalVariants,
    failed,
  };
  console.info('[db-push][products] done', result);
  return result;
}
