import { Q } from '@nozbe/watermelondb';
import { sanitizedRaw } from '@nozbe/watermelondb/RawRecord';

import type { Product as PayloadProduct, Variant as PayloadVariant } from '../types';

import { buildProduct, buildVariant } from '../builder';
import { database } from '../index';
import Product from '../model/Product';
import ProductVariant from '../model/ProductVariant';
import { isSoftDeleted } from '../utils';
import { fetchProducts } from './apis';
import { getLastFetchedProducts, setLastFetchedProducts } from './sync-meta-store';

async function buildVariantOperations(params: {
  activeDocs: (PayloadProduct & { variants?: PayloadVariant[] })[];
  activeIds: string[];
  variantsCollection: ReturnType<typeof database.get<ProductVariant>>;
}) {
  const { activeDocs, activeIds, variantsCollection } = params;

  const variantsToSync = activeDocs.flatMap((product) =>
    (product.variants ?? []).map((variant) => ({ variant, productId: product.id }))
  );
  const remoteVariantIds = new Set(variantsToSync.map((entry) => entry.variant.id));

  const localVariants = await variantsCollection
    .query(Q.where('product_id', Q.oneOf(activeIds)))
    .fetch();

  const localById = new Map(localVariants.map((variant) => [variant.id, variant]));
  const variantsToUpdate = variantsToSync.filter((entry) => localById.has(entry.variant.id));
  const variantsToCreate = variantsToSync.filter((entry) => !localById.has(entry.variant.id));

  const createVariantOps = variantsToCreate.map((entry) =>
    variantsCollection.prepareCreate((row) => {
      row._raw = sanitizedRaw(
        { id: entry.variant.id, product_id: entry.productId },
        variantsCollection.schema
      );
      Object.assign(row, buildVariant(entry.variant));
    })
  );

  const updateVariantOps = variantsToUpdate.map((entry) => {
    const variant = localById.get(entry.variant.id)!;
    return variant.prepareUpdate((row) => {
      Object.assign(row, buildVariant(entry.variant));
    });
  });

  const deleteVariantOps = localVariants
    .filter((variant) => !remoteVariantIds.has(variant.id))
    .map((variant) => variant.prepareDestroyPermanently());

  return {
    operations: [...createVariantOps, ...updateVariantOps, ...deleteVariantOps],
    syncedCount: variantsToSync.length,
  };
}

export async function syncProductsFromApi(options?: { pageSize?: number }) {
  const pageSize = options?.pageSize ?? 100;
  const productsCollection = database.get<Product>('products');
  const variantsCollection = database.get<ProductVariant>('variants');
  const lastFetchedProducts = getLastFetchedProducts();
  const runCursor = lastFetchedProducts;

  let page = 1;
  let hasNext = true;
  let productCount = 0;
  let variantCount = 0;
  let checkpointCursor = lastFetchedProducts;

  while (hasNext) {
    const { docs: pageDocs, hasNext: nextPage } = await fetchProducts({
      page,
      pageSize,
      cursor: runCursor,
    });
    const deletedDocs = pageDocs.filter(isSoftDeleted);
    const activeDocs = pageDocs.filter((doc) => !isSoftDeleted(doc));
    const pageOperations: any[] = [];

    // 1) Build delete operations (variants first, then products)
    const deletedIds = deletedDocs.map((doc) => doc.id);
    const localProductsToDelete = await productsCollection
      .query(Q.where('id', Q.oneOf(deletedIds)))
      .fetch();
    const productIds = localProductsToDelete.map((product) => product.id);

    const localVariantsToDelete = await variantsCollection
      .query(Q.where('product_id', Q.oneOf(productIds)))
      .fetch();

    const deleteVariantOps = localVariantsToDelete.map((variant) =>
      variant.prepareDestroyPermanently()
    );
    const deleteProductOps = localProductsToDelete.map((product) =>
      product.prepareDestroyPermanently()
    );

    pageOperations.push(...deleteVariantOps, ...deleteProductOps);

    // 2) Build product create/update operations
    const activeIds = activeDocs.map((doc) => doc.id);
    const localActiveProducts = await productsCollection
      .query(Q.where('id', Q.oneOf(activeIds)))
      .fetch();

    const localById = new Map(localActiveProducts.map((product) => [product.id, product]));
    const productsToUpdate = activeDocs.filter((doc) => localById.has(doc.id));
    const productsToCreate = activeDocs.filter((doc) => !localById.has(doc.id));

    const createProductOps = productsToCreate.map((doc) => {
      const fields = buildProduct(doc);
      return productsCollection.prepareCreate((row) => {
        row._raw = sanitizedRaw({ id: doc.id }, productsCollection.schema);
        Object.assign(row, fields);
      });
    });

    const updateProductOps = productsToUpdate.map((doc) => {
      const product = localById.get(doc.id)!;
      const fields = buildProduct(doc);
      return product.prepareUpdate((row) => {
        Object.assign(row, fields);
      });
    });

    pageOperations.push(...createProductOps, ...updateProductOps);
    productCount += activeDocs.length;

    // 3) Build variant create/update/delete operations for active products
    const variantResult = await buildVariantOperations({
      activeDocs,
      activeIds,
      variantsCollection,
    });
    pageOperations.push(...variantResult.operations);
    variantCount += variantResult.syncedCount;

    // 4) Commit this page in one batch
    if (pageOperations.length > 0) {
      await database.write(async () => {
        await database.batch(...pageOperations);
      });
    }

    // 5) Save incremental checkpoint for retry safety
    const pageUpdatedAt = pageDocs
      .map((doc) => Date.parse(doc.updatedAt ?? ''))
      .filter((ms) => Number.isFinite(ms))
      .sort((a, b) => b - a)[0];
    if (pageUpdatedAt != null) {
      checkpointCursor = new Date(pageUpdatedAt).toISOString();
      setLastFetchedProducts(checkpointCursor);
    }

    hasNext = nextPage;
    page += 1;
  }

  if (!checkpointCursor) {
    checkpointCursor = new Date().toISOString();
    setLastFetchedProducts(checkpointCursor);
  }

  return {
    syncedAt: checkpointCursor,
    products: productCount,
    variants: variantCount,
  };
}
