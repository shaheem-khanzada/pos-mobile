import { Q } from '@nozbe/watermelondb';

import { database } from '../db';
import Category from '../model/Category';
import Media from '../model/Media';
import Product from '../model/Product';
import ProductVariant from '../model/ProductVariant';
import VariantOption from '../model/VariantOption';
import VariantType from '../model/VariantType';
import { extractRemoteCreatedId } from '../utils';
import {
  createCategoryRemote,
  createMediaRemote,
  createProductRemote,
  createVariantOptionRemote,
  createVariantTypeRemote,
  createVariantRemote,
  deleteCategoryRemote,
  deleteMediaRemote,
  deleteProductRemote,
  deleteVariantOptionRemote,
  deleteVariantTypeRemote,
  deleteVariantRemote,
  updateCategoryRemote,
  updateMediaRemote,
  updateProductRemote,
  updateVariantOptionRemote,
  updateVariantTypeRemote,
  updateVariantRemote,
} from './apis';
import {
  buildCategoryPushData,
  buildMediaPushData,
  buildProductPushData,
  buildVariantOptionPushData,
  buildVariantPushData,
  buildVariantTypePushData,
} from './builders';

let inFlightProductsPush: Promise<any> | null = null;

const logPushResult = (step: string, result: object) => {
  console.info(`[db-push][products] ${step}`, result);
};

const pushCreatedCategories = async () => {
  const categoriesCollection = database.get<Category>('categories');

  const createdCategories = await categoriesCollection
    .query(Q.where('sync_state', 'created'))
    .fetch();
  let pushedCategories = 0;
  let failed = 0;

  for (const category of createdCategories) {
    try {
      const response = await createCategoryRemote({
        id: category.id,
        ...buildCategoryPushData(category),
      });
      const remoteId = extractRemoteCreatedId(response);
      if (!remoteId) {
        throw new Error('[db-push][categories] missing remote id after create');
      }
      if (remoteId !== category.id) {
        throw new Error(
          `[db-push][categories] remote id mismatch after create: remote=${remoteId} local=${category.id}`
        );
      }
      await category.markAsSynced();
      pushedCategories += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: createdCategories.length,
    pushedCategories,
    failed,
  };
  logPushResult('pushCreatedCategories', result);
  return result;
};

const pushUpdatedCategories = async () => {
  const categoriesCollection = database.get<Category>('categories');

  const updatedCategories = await categoriesCollection
    .query(Q.where('sync_state', 'updated'))
    .fetch();
  let pushedCategories = 0;
  let failed = 0;

  for (const category of updatedCategories) {
    try {
      await updateCategoryRemote(category.id, buildCategoryPushData(category));
      await category.markAsSynced();
      pushedCategories += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: updatedCategories.length,
    pushedCategories,
    failed,
  };
  logPushResult('pushUpdatedCategories', result);
  return result;
};

const pushCreatedMedia = async () => {
  const mediaCollection = database.get<Media>('media');

  const createdMedia = await mediaCollection
    .query(Q.where('sync_state', 'created'))
    .fetch();
  let pushedMedia = 0;
  let failed = 0;

  for (const media of createdMedia) {
    try {
      const response = await createMediaRemote({
        id: media.id,
        ...buildMediaPushData(media),
      });
      const remoteId = extractRemoteCreatedId(response);
      if (!remoteId) {
        throw new Error('[db-push][media] missing remote id after create');
      }
      if (remoteId !== media.id) {
        throw new Error(
          `[db-push][media] remote id mismatch after create: remote=${remoteId} local=${media.id}`
        );
      }
      const remoteUrl = typeof (response as any)?.url === 'string' ? (response as any).url : null;
      await media.markCreatedSynced(remoteUrl);
      pushedMedia += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: createdMedia.length,
    pushedMedia,
    failed,
  };
  logPushResult('pushCreatedMedia', result);
  return result;
};

const pushUpdatedMedia = async () => {
  const mediaCollection = database.get<Media>('media');

  const updatedMedia = await mediaCollection
    .query(Q.where('sync_state', 'updated'))
    .fetch();
  let pushedMedia = 0;
  let failed = 0;

  for (const media of updatedMedia) {
    try {
      await updateMediaRemote(media.id, buildMediaPushData(media));
      await media.markAsSynced();
      pushedMedia += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: updatedMedia.length,
    pushedMedia,
    failed,
  };
  logPushResult('pushUpdatedMedia', result);
  return result;
};

const pushCreatedProducts = async () => {
  const productsCollection = database.get<Product>('products');

  const createdProducts = await productsCollection
    .query(Q.where('sync_state', 'created'))
    .fetch();
  let pushedProducts = 0;
  let failed = 0;

  for (const product of createdProducts) {
    try {
      const response = await createProductRemote({
        id: product.id,
        ...buildProductPushData(product),
      });
      const remoteId = extractRemoteCreatedId(response);
      if (!remoteId) {
        throw new Error('[db-push][products] missing remote id after create');
      }
      if (remoteId !== product.id) {
        throw new Error(
          `[db-push][products] remote id mismatch after create: remote=${remoteId} local=${product.id}`
        );
      }
      await product.markAsSynced();
      pushedProducts += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: createdProducts.length,
    pushedProducts,
    failed,
  };
  logPushResult('pushCreatedProducts', result);
  return result;
};

const pushUpdatedProducts = async () => {
  const productsCollection = database.get<Product>('products');

  const updatedProducts = await productsCollection
    .query(Q.where('sync_state', 'updated'))
    .fetch();
  let pushedProducts = 0;
  let failed = 0;

  for (const product of updatedProducts) {
    try {
      await updateProductRemote(product.id, buildProductPushData(product));
      await product.markAsSynced();
      pushedProducts += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: updatedProducts.length,
    pushedProducts,
    failed,
  };
  logPushResult('pushUpdatedProducts', result);
  return result;
};

const pushCreatedVariantTypes = async () => {
  const variantTypesCollection = database.get<VariantType>('variant_types');

  const createdVariantTypes = await variantTypesCollection
    .query(Q.where('sync_state', 'created'))
    .fetch();
  let pushedVariantTypes = 0;
  let failed = 0;

  for (const variantType of createdVariantTypes) {
    try {
      const response = await createVariantTypeRemote({
        id: variantType.id,
        ...buildVariantTypePushData(variantType),
      });
      const remoteId = extractRemoteCreatedId(response);
      if (!remoteId) {
        throw new Error('[db-push][variant-types] missing remote id after create');
      }
      if (remoteId !== variantType.id) {
        throw new Error(
          `[db-push][variant-types] remote id mismatch after create: remote=${remoteId} local=${variantType.id}`
        );
      }
      await variantType.markAsSynced();
      pushedVariantTypes += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: createdVariantTypes.length,
    pushedVariantTypes,
    failed,
  };
  logPushResult('pushCreatedVariantTypes', result);
  return result;
};

const pushUpdatedVariantTypes = async () => {
  const variantTypesCollection = database.get<VariantType>('variant_types');

  const updatedVariantTypes = await variantTypesCollection
    .query(Q.where('sync_state', 'updated'))
    .fetch();
  let pushedVariantTypes = 0;
  let failed = 0;

  for (const variantType of updatedVariantTypes) {
    try {
      await updateVariantTypeRemote(variantType.id, buildVariantTypePushData(variantType));
      await variantType.markAsSynced();
      pushedVariantTypes += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: updatedVariantTypes.length,
    pushedVariantTypes,
    failed,
  };
  logPushResult('pushUpdatedVariantTypes', result);
  return result;
};

const pushCreatedVariantOptions = async () => {
  const variantOptionsCollection = database.get<VariantOption>('variant_options');

  const createdVariantOptions = await variantOptionsCollection
    .query(Q.where('sync_state', 'created'))
    .fetch();
  let pushedVariantOptions = 0;
  let failed = 0;

  for (const variantOption of createdVariantOptions) {
    try {
      const response = await createVariantOptionRemote({
        id: variantOption.id,
        ...buildVariantOptionPushData(variantOption),
      });
      const remoteId = extractRemoteCreatedId(response);
      if (!remoteId) {
        throw new Error('[db-push][variant-options] missing remote id after create');
      }
      if (remoteId !== variantOption.id) {
        throw new Error(
          `[db-push][variant-options] remote id mismatch after create: remote=${remoteId} local=${variantOption.id}`
        );
      }
      await variantOption.markAsSynced();
      pushedVariantOptions += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: createdVariantOptions.length,
    pushedVariantOptions,
    failed,
  };
  logPushResult('pushCreatedVariantOptions', result);
  return result;
};

const pushUpdatedVariantOptions = async () => {
  const variantOptionsCollection = database.get<VariantOption>('variant_options');

  const updatedVariantOptions = await variantOptionsCollection
    .query(Q.where('sync_state', 'updated'))
    .fetch();
  let pushedVariantOptions = 0;
  let failed = 0;

  for (const variantOption of updatedVariantOptions) {
    try {
      await updateVariantOptionRemote(
        variantOption.id,
        buildVariantOptionPushData(variantOption)
      );
      await variantOption.markAsSynced();
      pushedVariantOptions += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: updatedVariantOptions.length,
    pushedVariantOptions,
    failed,
  };
  logPushResult('pushUpdatedVariantOptions', result);
  return result;
};

const pushCreatedVariants = async () => {
  const variantsCollection = database.get<ProductVariant>('variants');

  const createdVariants = await variantsCollection
    .query(Q.where('sync_state', 'created'))
    .fetch();
  let pushedVariants = 0;
  let failed = 0;

  for (const variant of createdVariants) {
    try {
      const response = await createVariantRemote({
        id: variant.id,
        ...buildVariantPushData(variant),
      });
      const remoteId = extractRemoteCreatedId(response);
      if (!remoteId) {
        throw new Error('[db-push][variants] missing remote id after create');
      }
      if (remoteId !== variant.id) {
        throw new Error(
          `[db-push][variants] remote id mismatch after create: remote=${remoteId} local=${variant.id}`
        );
      }
      await variant.markAsSynced();
      pushedVariants += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: createdVariants.length,
    pushedVariants,
    failed,
  };
  logPushResult('pushCreatedVariants', result);
  return result;
};

const pushUpdatedVariants = async () => {
  const variantsCollection = database.get<ProductVariant>('variants');

  const updatedVariants = await variantsCollection
    .query(Q.where('sync_state', 'updated'))
    .fetch();
  let pushedVariants = 0;
  let failed = 0;

  for (const variant of updatedVariants) {
    try {
      await updateVariantRemote(variant.id, buildVariantPushData(variant));
      await variant.markAsSynced();
      pushedVariants += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: updatedVariants.length,
    pushedVariants,
    failed,
  };
  logPushResult('pushUpdatedVariants', result);
  return result;
};

const pushDeletedVariants = async () => {
  const variantsCollection = database.get<ProductVariant>('variants');
  const deletedVariants = await variantsCollection
    .query(Q.where('sync_state', 'deleted'))
    .fetch();
  let deletedLocalVariants = 0;
  let failed = 0;

  for (const variant of deletedVariants) {
    try {
      await deleteVariantRemote(variant.id);
      await database.write(async () => {
        await database.batch(variant.prepareDestroyPermanently());
      });
      deletedLocalVariants += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: deletedVariants.length,
    deletedLocalVariants,
    failed,
  };
  logPushResult('pushDeletedVariants', result);
  return result;
};

const pushDeletedVariantOptions = async () => {
  const variantOptionsCollection = database.get<VariantOption>('variant_options');
  const deletedVariantOptions = await variantOptionsCollection
    .query(Q.where('sync_state', 'deleted'))
    .fetch();
  let deletedLocalVariantOptions = 0;
  let failed = 0;

  for (const variantOption of deletedVariantOptions) {
    try {
      await deleteVariantOptionRemote(variantOption.id);
      await variantOption.markAsDeleted();
      deletedLocalVariantOptions += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: deletedVariantOptions.length,
    deletedLocalVariantOptions,
    failed,
  };
  logPushResult('pushDeletedVariantOptions', result);
  return result;
};

const pushDeletedVariantTypes = async () => {
  const variantTypesCollection = database.get<VariantType>('variant_types');
  const deletedVariantTypes = await variantTypesCollection
    .query(Q.where('sync_state', 'deleted'))
    .fetch();
  let deletedLocalVariantTypes = 0;
  let failed = 0;

  for (const variantType of deletedVariantTypes) {
    try {
      await deleteVariantTypeRemote(variantType.id);
      await variantType.markAsDeleted();
      deletedLocalVariantTypes += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: deletedVariantTypes.length,
    deletedLocalVariantTypes,
    failed,
  };
  logPushResult('pushDeletedVariantTypes', result);
  return result;
};

const pushDeletedProducts = async () => {
  const productsCollection = database.get<Product>('products');

  const deletedProducts = await productsCollection
    .query(Q.where('sync_state', 'deleted'))
    .fetch();
  let deletedLocalProducts = 0;
  let failed = 0;
  for (const product of deletedProducts) {
    try {
      await deleteProductRemote(product.id);
      await product.markAsDeleted();
      deletedLocalProducts += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: deletedProducts.length,
    deletedLocalProducts,
    failed,
  };
  logPushResult('pushDeletedProducts', result);
  return result;
};

const pushDeletedCategories = async () => {
  const categoriesCollection = database.get<Category>('categories');

  const deletedCategories = await categoriesCollection
    .query(Q.where('sync_state', 'deleted'))
    .fetch();
  let deletedLocalCategories = 0;
  let failed = 0;

  for (const category of deletedCategories) {
    try {
      await deleteCategoryRemote(category.id);
      await category.markAsDeleted();
      deletedLocalCategories += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: deletedCategories.length,
    deletedLocalCategories,
    failed,
  };
  logPushResult('pushDeletedCategories', result);
  return result;
};

const pushDeletedMedia = async () => {
  const mediaCollection = database.get<Media>('media');

  const deletedMedia = await mediaCollection
    .query(Q.where('sync_state', 'deleted'))
    .fetch();
  let deletedLocalMedia = 0;
  let failed = 0;

  for (const media of deletedMedia) {
    try {
      await deleteMediaRemote(media.id);
      await media.markAsDeleted();
      deletedLocalMedia += 1;
    } catch (error) {
      failed += 1;
      throw error;
    }
  }

  const result = {
    input: deletedMedia.length,
    deletedLocalMedia,
    failed,
  };
  logPushResult('pushDeletedMedia', result);
  return result;
};

export async function syncProductsToApi() {
  if (inFlightProductsPush) {
    return inFlightProductsPush;
  }

  inFlightProductsPush = (async () => {
    console.info('[db-push][products] start');
    await pushCreatedCategories();
    await pushUpdatedCategories();
    await pushCreatedMedia();
    await pushUpdatedMedia();
    await pushCreatedVariantTypes();
    await pushUpdatedVariantTypes();
    await pushCreatedVariantOptions();
    await pushUpdatedVariantOptions();
    await pushCreatedProducts();
    await pushUpdatedProducts();
    await pushCreatedVariants();
    await pushUpdatedVariants();
    await pushDeletedVariants();
    await pushDeletedProducts();
    await pushDeletedVariantOptions();
    await pushDeletedVariantTypes();
    await pushDeletedCategories();
    await pushDeletedMedia();
    await pushUpdatedProducts();
    await pushUpdatedVariants();
    const result = { failed: 0 };
    console.info('[db-push][products] done', result);
    return result;
  })();

  try {
    return await inFlightProductsPush;
  } finally {
    inFlightProductsPush = null;
  }
}
