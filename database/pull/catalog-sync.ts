import { Q } from '@nozbe/watermelondb';
import { sanitizedRaw, setRawSanitized } from '@nozbe/watermelondb/RawRecord';

import {
  buildCategory,
  buildMedia,
  buildVariantOption,
  buildVariantType,
} from '../builder';
import { database } from '../db';
import Category from '../model/Category';
import Media from '../model/Media';
import VariantOption from '../model/VariantOption';
import VariantType from '../model/VariantType';
import { extractId, isSoftDeleted } from '../utils';
import {
  fetchCategories,
  fetchMedia,
  fetchVariantOptions,
  fetchVariantTypes,
} from './apis';
import {
  getLastFetchedCategories,
  getLastFetchedMedia,
  getLastFetchedVariantOptions,
  getLastFetchedVariantTypes,
  setLastFetchedCategories,
  setLastFetchedMedia,
  setLastFetchedVariantOptions,
  setLastFetchedVariantTypes,
} from './sync-meta-store';

function isoCheckpointFromPageDocs(
  pageDocs: { updatedAt?: string | null | undefined }[],
): string | null {
  const pageUpdatedAt = pageDocs
    .map((doc) => Date.parse(doc.updatedAt ?? ''))
    .filter((ms) => Number.isFinite(ms))
    .sort((a, b) => b - a)[0];

  return pageUpdatedAt != null ? new Date(pageUpdatedAt).toISOString() : null;
}

export async function syncCategoriesFromApi(options?: { pageSize?: number }) {
  const pageSize = options?.pageSize ?? 100;
  const categoriesCollection = database.get<Category>('categories');
  const lastFetchedCategories = getLastFetchedCategories();
  const runCursor = lastFetchedCategories;

  let page = 1;
  let hasNext = true;
  let deleted = 0;
  let upserted = 0;
  let checkpointCursor = lastFetchedCategories;

  console.info('[db-sync][categories] start', {
    pageSize,
    runCursor,
  });

  while (hasNext) {
    const { docs: pageDocs, hasNext: nextPage } = await fetchCategories({
      page,
      pageSize,
      cursor: runCursor,
    });

    const deletedDocs = pageDocs.filter(isSoftDeleted);
    const activeDocs = pageDocs.filter((doc) => !isSoftDeleted(doc));
    const pageOperations: any[] = [];

    // 1) Build delete operations
    const deletedIds = deletedDocs.map((doc) => doc.id);

    if (deletedIds.length > 0) {
      const localToDelete = await categoriesCollection
        .query(Q.where('id', Q.oneOf(deletedIds)))
        .fetch();

      pageOperations.push(...localToDelete.map((row) => row.prepareDestroyPermanently()));
      deleted += localToDelete.length;
    }

    // 2) Build create/update operations for active docs
    const activeIds = activeDocs.map((doc) => doc.id);

    if (activeIds.length > 0) {
      const localActive = await categoriesCollection
        .query(Q.where('id', Q.oneOf(activeIds)))
        .fetch();

      const localById = new Map(localActive.map((row) => [row.id, row]));
      const docsToUpdate = activeDocs.filter((doc) => localById.has(doc.id));
      const docsToCreate = activeDocs.filter((doc) => !localById.has(doc.id));

      const createOps = docsToCreate.map((doc) => {
        const fields = buildCategory(doc);
        return categoriesCollection.prepareCreate((row) => {
          row._raw = sanitizedRaw({ id: doc.id }, categoriesCollection.schema);
          Object.assign(row, fields);
        });
      });

      const updateOps = docsToUpdate.map((doc) => {
        const existing = localById.get(doc.id)!;
        const fields = buildCategory(doc);
        return existing.prepareUpdate((row) => {
          Object.assign(row, fields);
        });
      });

      pageOperations.push(...createOps, ...updateOps);
      upserted += activeDocs.length;
    }

    // 3) Commit this page in one batch
    if (pageOperations.length > 0) {
      await database.write(async () => {
        await database.batch(...pageOperations);
      });
    }

    // Advance cursor progressively so retry resumes near the failure point.
    const nextCheckpoint = isoCheckpointFromPageDocs(
      pageDocs as { updatedAt?: string | null | undefined }[],
    );

    if (nextCheckpoint) {
      checkpointCursor = nextCheckpoint;
      setLastFetchedCategories(checkpointCursor);
    }

    console.info('[db-sync][categories] page', {
      page,
      fetched: pageDocs.length,
      active: activeDocs.length,
      deleted: deletedDocs.length,
      upsertedTotal: upserted,
      deletedTotal: deleted,
      checkpointCursor,
      hasNext: nextPage,
    });

    hasNext = nextPage;
    page += 1;
  }

  if (!checkpointCursor) {
    checkpointCursor = new Date().toISOString();
    setLastFetchedCategories(checkpointCursor);
  }

  console.info('[db-sync][categories] done', {
    upserted,
    deleted,
    checkpointCursor,
  });

  return {
    syncedAt: checkpointCursor,
    upserted,
    deleted,
  };
}

export async function syncVariantTypesFromApi(options?: { pageSize?: number }) {
  const pageSize = options?.pageSize ?? 100;
  const variantTypesCollection = database.get<VariantType>('variant_types');
  const lastFetchedVariantTypes = getLastFetchedVariantTypes();
  const runCursor = lastFetchedVariantTypes;

  let page = 1;
  let hasNext = true;
  let deleted = 0;
  let upserted = 0;
  let checkpointCursor = lastFetchedVariantTypes;

  console.info('[db-sync][variant-types] start', {
    pageSize,
    runCursor,
  });

  while (hasNext) {
    const { docs: pageDocs, hasNext: nextPage } = await fetchVariantTypes({
      page,
      pageSize,
      cursor: runCursor,
    });

    const deletedDocs = pageDocs.filter(isSoftDeleted);
    const activeDocs = pageDocs.filter((doc) => !isSoftDeleted(doc));
    const pageOperations: any[] = [];

    // 1) Build delete operations
    const deletedIds = deletedDocs.map((doc) => doc.id);

    if (deletedIds.length > 0) {
      const localToDelete = await variantTypesCollection
        .query(Q.where('id', Q.oneOf(deletedIds)))
        .fetch();

      pageOperations.push(...localToDelete.map((row) => row.prepareDestroyPermanently()));
      deleted += localToDelete.length;
    }

    // 2) Build create/update operations for active docs
    const activeIds = activeDocs.map((doc) => doc.id);

    if (activeIds.length > 0) {
      const localActive = await variantTypesCollection
        .query(Q.where('id', Q.oneOf(activeIds)))
        .fetch();

      const localById = new Map(localActive.map((row) => [row.id, row]));
      const docsToUpdate = activeDocs.filter((doc) => localById.has(doc.id));
      const docsToCreate = activeDocs.filter((doc) => !localById.has(doc.id));

      const createOps = docsToCreate.map((doc) => {
        const fields = buildVariantType(doc);
        return variantTypesCollection.prepareCreate((row) => {
          row._raw = sanitizedRaw({ id: doc.id }, variantTypesCollection.schema);
          Object.assign(row, fields);
        });
      });

      const updateOps = docsToUpdate.map((doc) => {
        const existing = localById.get(doc.id)!;
        const fields = buildVariantType(doc);
        return existing.prepareUpdate((row) => {
          Object.assign(row, fields);
        });
      });

      pageOperations.push(...createOps, ...updateOps);
      upserted += activeDocs.length;
    }

    // 3) Commit this page in one batch
    if (pageOperations.length > 0) {
      await database.write(async () => {
        await database.batch(...pageOperations);
      });
    }

    const nextCheckpoint = isoCheckpointFromPageDocs(
      pageDocs as { updatedAt?: string | null | undefined }[],
    );

    if (nextCheckpoint) {
      checkpointCursor = nextCheckpoint;
      setLastFetchedVariantTypes(checkpointCursor);
    }

    console.info('[db-sync][variant-types] page', {
      page,
      fetched: pageDocs.length,
      active: activeDocs.length,
      deleted: deletedDocs.length,
      upsertedTotal: upserted,
      deletedTotal: deleted,
      checkpointCursor,
      hasNext: nextPage,
    });

    hasNext = nextPage;
    page += 1;
  }

  if (!checkpointCursor) {
    checkpointCursor = new Date().toISOString();
    setLastFetchedVariantTypes(checkpointCursor);
  }

  console.info('[db-sync][variant-types] done', {
    upserted,
    deleted,
    checkpointCursor,
  });

  return {
    syncedAt: checkpointCursor,
    upserted,
    deleted,
  };
}

export async function syncVariantOptionsFromApi(options?: { pageSize?: number }) {
  const pageSize = options?.pageSize ?? 100;
  const variantOptionsCollection = database.get<VariantOption>('variant_options');
  const lastFetchedVariantOptions = getLastFetchedVariantOptions();
  const runCursor = lastFetchedVariantOptions;

  let page = 1;
  let hasNext = true;
  let deleted = 0;
  let upserted = 0;
  let checkpointCursor = lastFetchedVariantOptions;

  console.info('[db-sync][variant-options] start', {
    pageSize,
    runCursor,
  });

  while (hasNext) {
    const { docs: pageDocs, hasNext: nextPage } = await fetchVariantOptions({
      page,
      pageSize,
      cursor: runCursor,
    });

    const deletedDocs = pageDocs.filter(isSoftDeleted);
    const activeDocs = pageDocs.filter((doc) => !isSoftDeleted(doc));
    const pageOperations: any[] = [];

    // 1) Build delete operations
    const deletedIds = deletedDocs.map((doc) => doc.id);

    if (deletedIds.length > 0) {
      const localToDelete = await variantOptionsCollection
        .query(Q.where('id', Q.oneOf(deletedIds)))
        .fetch();

      pageOperations.push(...localToDelete.map((row) => row.prepareDestroyPermanently()));
      deleted += localToDelete.length;
    }

    // 2) Build create/update operations for active docs
    const activeIds = activeDocs.map((doc) => doc.id);

    if (activeIds.length > 0) {
      const localActive = await variantOptionsCollection
        .query(Q.where('id', Q.oneOf(activeIds)))
        .fetch();

      const localById = new Map(localActive.map((row) => [row.id, row]));
      const docsToUpdate = activeDocs.filter((doc) => localById.has(doc.id));
      const docsToCreate = activeDocs.filter((doc) => !localById.has(doc.id));

      const createOps = docsToCreate.map((doc) => {
        const fields = buildVariantOption(doc);
        const variantTypeId = extractId((doc as any).variantType) ?? null;
        return variantOptionsCollection.prepareCreate((row) => {
          row._raw = sanitizedRaw(
            { id: doc.id, variant_type: variantTypeId },
            variantOptionsCollection.schema
          );
          Object.assign(row, fields);
        });
      });

      const updateOps = docsToUpdate.map((doc) => {
        const existing = localById.get(doc.id)!;
        const fields = buildVariantOption(doc);
        const variantTypeId = extractId((doc as any).variantType) ?? null;
        return existing.prepareUpdate((row) => {
          Object.assign(row, fields);
          if (variantTypeId) {
            setRawSanitized(
              row._raw,
              'variant_type',
              variantTypeId,
              variantOptionsCollection.schema.columns.variant_type
            );
          }
        });
      });

      pageOperations.push(...createOps, ...updateOps);
      upserted += activeDocs.length;
    }

    // 3) Commit this page in one batch
    if (pageOperations.length > 0) {
      await database.write(async () => {
        await database.batch(...pageOperations);
      });
    }

    const nextCheckpoint = isoCheckpointFromPageDocs(
      pageDocs as { updatedAt?: string | null | undefined }[],
    );

    if (nextCheckpoint) {
      checkpointCursor = nextCheckpoint;
      setLastFetchedVariantOptions(checkpointCursor);
    }

    console.info('[db-sync][variant-options] page', {
      page,
      fetched: pageDocs.length,
      active: activeDocs.length,
      deleted: deletedDocs.length,
      upsertedTotal: upserted,
      deletedTotal: deleted,
      checkpointCursor,
      hasNext: nextPage,
    });

    hasNext = nextPage;
    page += 1;
  }

  if (!checkpointCursor) {
    checkpointCursor = new Date().toISOString();
    setLastFetchedVariantOptions(checkpointCursor);
  }

  console.info('[db-sync][variant-options] done', {
    upserted,
    deleted,
    checkpointCursor,
  });

  return {
    syncedAt: checkpointCursor,
    upserted,
    deleted,
  };
}

export async function syncMediaFromApi(options?: { pageSize?: number }) {
  const pageSize = options?.pageSize ?? 100;
  const mediaCollection = database.get<Media>('media');
  const lastFetchedMedia = getLastFetchedMedia();
  const runCursor = lastFetchedMedia;

  let page = 1;
  let hasNext = true;
  let deleted = 0;
  let upserted = 0;
  let checkpointCursor = lastFetchedMedia;

  console.info('[db-sync][media] start', {
    pageSize,
    runCursor,
  });

  while (hasNext) {
    const { docs: pageDocs, hasNext: nextPage } = await fetchMedia({
      page,
      pageSize,
      cursor: runCursor,
    });

    const deletedDocs = pageDocs.filter(isSoftDeleted);
    const activeDocs = pageDocs.filter((doc) => !isSoftDeleted(doc));
    const pageOperations: any[] = [];

    // 1) Build delete operations
    const deletedIds = deletedDocs.map((doc) => doc.id);

    if (deletedIds.length > 0) {
      const localToDelete = await mediaCollection
        .query(Q.where('id', Q.oneOf(deletedIds)))
        .fetch();

      pageOperations.push(...localToDelete.map((row) => row.prepareDestroyPermanently()));
      deleted += localToDelete.length;
    }

    // 2) Build create/update operations for active docs
    const activeIds = activeDocs.map((doc) => doc.id);

    if (activeIds.length > 0) {
      const localActive = await mediaCollection
        .query(Q.where('id', Q.oneOf(activeIds)))
        .fetch();

      const localById = new Map(localActive.map((row) => [row.id, row]));
      const docsToUpdate = activeDocs.filter((doc) => localById.has(doc.id));
      const docsToCreate = activeDocs.filter((doc) => !localById.has(doc.id));

      const createOps = docsToCreate.map((doc) => {
        const fields = buildMedia(doc);
        return mediaCollection.prepareCreate((row) => {
          row._raw = sanitizedRaw({ id: doc.id }, mediaCollection.schema);
          Object.assign(row, fields);
        });
      });

      const updateOps = docsToUpdate.map((doc) => {
        const existing = localById.get(doc.id)!;
        const fields = buildMedia(doc);
        return existing.prepareUpdate((row) => {
          Object.assign(row, fields);
        });
      });

      pageOperations.push(...createOps, ...updateOps);
      upserted += activeDocs.length;
    }

    // 3) Commit this page in one batch
    if (pageOperations.length > 0) {
      await database.write(async () => {
        await database.batch(...pageOperations);
      });
    }

    const nextCheckpoint = isoCheckpointFromPageDocs(
      pageDocs as { updatedAt?: string | null | undefined }[],
    );

    if (nextCheckpoint) {
      checkpointCursor = nextCheckpoint;
      setLastFetchedMedia(checkpointCursor);
    }

    console.info('[db-sync][media] page', {
      page,
      fetched: pageDocs.length,
      active: activeDocs.length,
      deleted: deletedDocs.length,
      upsertedTotal: upserted,
      deletedTotal: deleted,
      checkpointCursor,
      hasNext: nextPage,
    });

    hasNext = nextPage;
    page += 1;
  }

  if (!checkpointCursor) {
    checkpointCursor = new Date().toISOString();
    setLastFetchedMedia(checkpointCursor);
  }

  console.info('[db-sync][media] done', {
    upserted,
    deleted,
    checkpointCursor,
  });

  return {
    syncedAt: checkpointCursor,
    upserted,
    deleted,
  };
}

export async function syncCatalogFromApi(options?: { pageSize?: number }) {
  console.info('[db-sync][catalog] start');

  const categories = await syncCategoriesFromApi(options);
  const variantTypes = await syncVariantTypesFromApi(options);
  const variantOptions = await syncVariantOptionsFromApi(options);
  const media = await syncMediaFromApi(options);

  console.info('[db-sync][catalog] done', {
    categories,
    variantTypes,
    variantOptions,
    media,
  });

  return { categories, variantTypes, variantOptions, media };
}
