import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const databaseSchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'products',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'barcode', type: 'string', isOptional: true, isIndexed: true },
        { name: 'inventory', type: 'number', isOptional: true },
        { name: 'enable_variants', type: 'boolean', isOptional: true },
        { name: 'price_in_pkr_enabled', type: 'boolean', isOptional: true },
        { name: 'price_in_pkr', type: 'number', isOptional: true },
        { name: 'slug', type: 'string', isIndexed: true },
        { name: 'media', type: 'string', isOptional: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'variants',
      columns: [
        { name: 'product_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string', isOptional: true },
        { name: 'barcode', type: 'string', isOptional: true, isIndexed: true },
        { name: 'inventory', type: 'number', isOptional: true },
        { name: 'price_in_pkr_enabled', type: 'boolean', isOptional: true },
        { name: 'price_in_pkr', type: 'number', isOptional: true },
        { name: 'options_json', type: 'string', isOptional: true },
        { name: 'deleted_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'orders',
      columns: [
        { name: 'status', type: 'string', isIndexed: true },
        { name: 'payment_method', type: 'string', isIndexed: true },
        { name: 'customer_name', type: 'string' },
        { name: 'customer_phone', type: 'string', isOptional: true },
        { name: 'currency', type: 'string', isOptional: true },
        { name: 'subtotal', type: 'number', isOptional: true },
        { name: 'purchased_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'order_items',
      columns: [
        { name: 'order_id', type: 'string', isIndexed: true },
        { name: 'product_id', type: 'string', isIndexed: true },
        { name: 'variant_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'quantity', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});

export default databaseSchema;
