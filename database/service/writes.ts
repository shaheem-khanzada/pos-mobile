import { sanitizedRaw, setRawSanitized } from '@nozbe/watermelondb/RawRecord';

import { database } from '../db';
import Category from '../model/Category';
import MediaModel from '../model/Media';
import Order from '../model/Order';
import OrderItem from '../model/OrderItem';
import Product from '../model/Product';
import ProductVariant from '../model/ProductVariant';
import VariantOption from '../model/VariantOption';
import type { Media as MediaRelation, SyncState } from '../types';
import { extractId, nextSyncState } from '../utils';

type RelationInput = string | { id: string } | null | undefined;

export type CreateLocalProductInput = {
  title: string;
  tenant?: RelationInput;
  description?: string | null;
  barcode?: string | null;
  inventory?: number | null;
  enableVariants?: boolean | null;
  priceInPKREnabled?: boolean | null;
  priceInPKR?: number | null;
  costInPKREnabled?: boolean | null;
  costInPKR?: number | null;
  categories?: string[] | null;
  variantTypes?: string[] | null;
  media?: string | MediaRelation | null;
};

export async function createLocalProduct(input: CreateLocalProductInput): Promise<Product> {
  const tenantId = extractId(input.tenant);
  const mediaId = extractId(input.media as RelationInput);

  let created!: Product;

  await database.write(async () => {
    created = await database.get<Product>('products').create((record) => {
      const now = new Date();
      record.media.id = mediaId ?? null;
      Object.assign(record, {
        title: input.title,
        description: input.description ?? null,
        barcode: input.barcode ?? null,
        inventory: input.inventory ?? null,
        enableVariants: input.enableVariants ?? null,
        priceInPKREnabled: input.priceInPKREnabled ?? null,
        priceInPKR: input.priceInPKR ?? null,
        costInPKREnabled: input.costInPKREnabled ?? null,
        costInPKR: input.costInPKR ?? null,
        categories: input.categories ?? [],
        variantTypes: input.variantTypes ?? [],
        tenant: tenantId ?? null,
        deletedAt: null,
        syncState: 'created' satisfies SyncState,
        createdAt: now,
        updatedAt: now,
      });
    });
  });

  return created;
}

export type UpdateLocalProductPatch = Partial<
  Pick<
    CreateLocalProductInput,
    | 'title'
    | 'tenant'
    | 'description'
    | 'barcode'
    | 'inventory'
    | 'enableVariants'
    | 'priceInPKREnabled'
    | 'priceInPKR'
    | 'costInPKREnabled'
    | 'costInPKR'
    | 'categories'
    | 'variantTypes'
    | 'media'
  >
>;

export async function updateLocalProduct(
  id: string,
  patch: UpdateLocalProductPatch
): Promise<void> {
  const tenantId =
    patch.tenant !== undefined
      ? extractId(patch.tenant)
      : undefined;
  const mediaId =
    patch.media !== undefined
      ? extractId(patch.media as RelationInput)
      : undefined;

  await database.write(async () => {
    const row = await database.get<Product>('products').find(id);
    await database.batch(
      row.prepareUpdate((record) => {
        const now = new Date();
        if (patch.title !== undefined) record.title = patch.title;
        if (patch.description !== undefined) record.description = patch.description ?? null;
        if (patch.barcode !== undefined) record.barcode = patch.barcode ?? null;
        if (patch.inventory !== undefined) record.inventory = patch.inventory ?? null;
        if (patch.enableVariants !== undefined) record.enableVariants = patch.enableVariants ?? null;
        if (patch.priceInPKREnabled !== undefined) {
          record.priceInPKREnabled = patch.priceInPKREnabled ?? null;
        }
        if (patch.priceInPKR !== undefined) record.priceInPKR = patch.priceInPKR ?? null;
        if (patch.costInPKREnabled !== undefined) {
          record.costInPKREnabled = patch.costInPKREnabled ?? null;
        }
        if (patch.costInPKR !== undefined) record.costInPKR = patch.costInPKR ?? null;
        if (patch.categories !== undefined) record.categories = patch.categories ?? [];
        if (patch.variantTypes !== undefined) record.variantTypes = patch.variantTypes ?? [];
        if (mediaId !== undefined) record.media.id = mediaId ?? null;
        if (tenantId !== undefined) record.tenant = tenantId ?? null;

        record.syncState = nextSyncState(row.syncState);
        record.updatedAt = now;
      })
    );
  });
}

/** Soft pending delete locally; remote delete happens in push sync. */
export async function deleteLocalProduct(id: string): Promise<void> {
  await database.write(async () => {
    const row = await database.get<Product>('products').find(id);
    await database.batch(
      row.prepareUpdate((record) => {
        record.syncState = 'deleted';
        record.updatedAt = new Date();
      })
    );
  });
}

export type CreateLocalVariantInput = {
  productId: string;
  tenant?: RelationInput;
  title?: string | null;
  barcode?: string | null;
  inventory?: number | null;
  priceInPKREnabled?: boolean | null;
  priceInPKR?: number | null;
  costInPKREnabled?: boolean | null;
  costInPKR?: number | null;
  options?: string[] | null;
};

export async function createLocalVariant(input: CreateLocalVariantInput): Promise<ProductVariant> {
  const tenantId = extractId(input.tenant);

  let created!: ProductVariant;

  await database.write(async () => {
    const variantsCollection = database.get<ProductVariant>('variants');
    created = await variantsCollection.create((record) => {
      record._raw = sanitizedRaw({ product_id: input.productId }, variantsCollection.schema);
      const now = new Date();
      Object.assign(record, {
        title: input.title ?? null,
        barcode: input.barcode ?? null,
        inventory: input.inventory ?? null,
        priceInPKREnabled: input.priceInPKREnabled ?? null,
        priceInPKR: input.priceInPKR ?? null,
        costInPKREnabled: input.costInPKREnabled ?? null,
        costInPKR: input.costInPKR ?? null,
        options: input.options ?? [],
        tenant: tenantId ?? null,
        deletedAt: null,
        syncState: 'created' satisfies SyncState,
        createdAt: now,
        updatedAt: now,
      });
    });
  });

  return created;
}

export type UpdateLocalVariantPatch = Partial<Omit<CreateLocalVariantInput, 'productId'>> & {
  productId?: string;
};

export async function updateLocalVariant(id: string, patch: UpdateLocalVariantPatch): Promise<void> {
  const tenantId =
    patch.tenant !== undefined
      ? extractId(patch.tenant)
      : undefined;

  await database.write(async () => {
    const variant = await database.get<ProductVariant>('variants').find(id);
    await database.batch(
      variant.prepareUpdate((record) => {
        const now = new Date();
        if (patch.title !== undefined) record.title = patch.title ?? null;
        if (patch.barcode !== undefined) record.barcode = patch.barcode ?? null;
        if (patch.inventory !== undefined) record.inventory = patch.inventory ?? null;
        if (patch.priceInPKREnabled !== undefined) {
          record.priceInPKREnabled = patch.priceInPKREnabled ?? null;
        }
        if (patch.priceInPKR !== undefined) record.priceInPKR = patch.priceInPKR ?? null;
        if (patch.costInPKREnabled !== undefined) {
          record.costInPKREnabled = patch.costInPKREnabled ?? null;
        }
        if (patch.costInPKR !== undefined) record.costInPKR = patch.costInPKR ?? null;
        if (patch.options !== undefined) record.options = patch.options ?? [];
        if (tenantId !== undefined) record.tenant = tenantId ?? null;
        if (patch.productId !== undefined) {
          setRawSanitized(
            record._raw,
            'product_id',
            patch.productId,
            variant.collection.schema.columns.product_id
          );
        }

        record.syncState = nextSyncState(variant.syncState);
        record.updatedAt = now;
      })
    );
  });
}

export async function deleteLocalVariant(id: string): Promise<void> {
  await database.write(async () => {
    const variant = await database.get<ProductVariant>('variants').find(id);

    if (variant.syncState === 'created') {
      await database.batch(variant.prepareDestroyPermanently());
      return;
    }

    await database.batch(
      variant.prepareUpdate((record) => {
        record.syncState = 'deleted';
        record.updatedAt = new Date();
      })
    );
  });
}

export type CreateLocalCategoryInput = {
  title: string;
  tenant?: RelationInput;
};

export async function createLocalCategory(input: CreateLocalCategoryInput): Promise<Category> {
  const tenantId = extractId(input.tenant);
  let created!: Category;

  await database.write(async () => {
    created = await database.get<Category>('categories').create((record) => {
      const now = new Date();
      Object.assign(record, {
        title: input.title.trim(),
        tenant: tenantId ?? null,
        deletedAt: null,
        syncState: 'created' satisfies SyncState,
        createdAt: now,
        updatedAt: now,
      });
    });
  });

  return created;
}

export type CreateLocalVariantOptionInput = {
  label: string;
  value?: string | null;
  variantTypeId: string;
  tenant?: RelationInput;
};

export async function createLocalVariantOption(
  input: CreateLocalVariantOptionInput
): Promise<VariantOption> {
  const tenantId = extractId(input.tenant);
  let created!: VariantOption;

  await database.write(async () => {
    const variantOptionsCollection = database.get<VariantOption>('variant_options');
    created = await variantOptionsCollection.create((record) => {
      const now = new Date();
      record._raw = sanitizedRaw(
        { variant_type: input.variantTypeId },
        variantOptionsCollection.schema
      );
      Object.assign(record, {
        label: input.label.trim(),
        value: input.value?.trim() || input.label.trim(),
        tenant: tenantId ?? null,
        deletedAt: null,
        syncState: 'created' satisfies SyncState,
        createdAt: now,
        updatedAt: now,
      });
    });
  });

  return created;
}

export type CreateLocalMediaInput = {
  alt: string;
  url: string;
  fileName?: string | null;
  mimeType?: string | null;
  tenant?: RelationInput;
};

export async function createLocalMedia(input: CreateLocalMediaInput): Promise<MediaModel> {
  const tenantId = extractId(input.tenant);
  let created!: MediaModel;

  await database.write(async () => {
    created = await database.get<MediaModel>('media').create((record) => {
      const now = new Date();
      Object.assign(record, {
        alt: input.alt.trim(),
        url: input.url,
        fileName: input.fileName ?? null,
        mimeType: input.mimeType ?? null,
        tenant: tenantId ?? null,
        syncState: 'created' satisfies SyncState,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
      });
    });
  });

  return created;
}

export type CreateLocalOrderLineInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPriceInPKR?: number | null;
  unitCostInPKR?: number | null;
};

export type CreateLocalOrderInput = {
  status: string;
  paymentMethod: Order['paymentMethod'];
  customerName: string;
  customerPhone?: string | null;
  currency?: string | null;
  /** Sum of line totals before order-level discount. */
  subtotal?: number | null;
  /** Order-level discount in PKR; charged amount is subtotal − discount. */
  discount?: number | null;
  tenant?: string | { id: string } | null;
  purchasedAt?: Date | null;
};

export async function createLocalOrder(
  input: CreateLocalOrderInput,
  lines: CreateLocalOrderLineInput[]
): Promise<Order> {
  const tenantId = extractId(input.tenant);

  let order!: Order;

  await database.write(async () => {
    const ordersCollection = database.get<Order>('orders');
    const orderItemsCollection = database.get<OrderItem>('order_items');

    order = await ordersCollection.create((record) => {
      const now = new Date();
      Object.assign(record, {
        status: input.status,
        paymentMethod: input.paymentMethod,
        customerName: input.customerName,
        customerPhone: input.customerPhone ?? null,
        currency: input.currency ?? 'PKR',
        subtotal: input.subtotal ?? null,
        discount: input.discount ?? null,
        tenant: tenantId ?? null,
        purchasedAt: input.purchasedAt ?? null,
        syncState: 'created' satisfies SyncState,
        createdAt: now,
        updatedAt: now,
      });
    });

    for (const line of lines) {
      await orderItemsCollection.create((record) => {
        const ts = Date.now();
        record._raw = sanitizedRaw(
          {
            order_id: order.id,
            product_id: line.productId,
            variant_id: line.variantId ?? null,
            quantity: line.quantity,
            unit_price_in_pkr: line.unitPriceInPKR ?? null,
            unit_cost_in_pkr: line.unitCostInPKR ?? null,
            created_at: ts,
            updated_at: ts,
          },
          orderItemsCollection.schema
        );
      });
    }
  });

  return order;
}
