import { Q } from '@nozbe/watermelondb';

import { database } from '../db';
import Order from '../model/Order';
import OrderItem from '../model/OrderItem';
import Product from '../model/Product';
import ProductVariant from '../model/ProductVariant';

export function fetchProductsObservable(params?: {
  tenantId?: string | null;
  search?: string;
}) {
  const filters: Q.Clause[] = [
    Q.sortBy('updated_at', Q.desc),
  ];

  if (params?.tenantId) {
    filters.push(Q.where('tenant', params.tenantId));
  }

  const search = params?.search?.trim() ?? '';
  if (search) {
    const like = `%${Q.sanitizeLikeString(search)}%`;
    filters.push(
      Q.or(
        Q.where('title', Q.like(like)),
        Q.where('barcode', Q.like(like)),
        Q.where('slug', Q.like(like))
      )
    );
  }

  return database
    .get<Product>('products')
    .query(...filters)
    .observe();
}

export function fetchVariantsObservable(params?: {
  productId?: string;
  tenantId?: string | null;
  search?: string;
}) {
  const filters: Q.Clause[] = [
    Q.sortBy('updated_at', Q.desc),
  ];

  if (params?.productId) {
    filters.push(Q.where('product_id', params.productId));
  }
  if (params?.tenantId) {
    filters.push(Q.where('tenant', params.tenantId));
  }

  const search = params?.search?.trim() ?? '';
  if (search) {
    const like = `%${Q.sanitizeLikeString(search)}%`;
    filters.push(
      Q.or(
        Q.where('title', Q.like(like)),
        Q.where('barcode', Q.like(like))
      )
    );
  }

  return database
    .get<ProductVariant>('variants')
    .query(...filters)
    .observe();
}

export function fetchOrdersObservable(params?: {
  tenantId?: string | null;
  status?: string;
  search?: string;
}) {
  const filters: Q.Clause[] = [
    Q.sortBy('updated_at', Q.desc),
  ];

  if (params?.tenantId) {
    filters.push(Q.where('tenant', params.tenantId));
  }
  if (params?.status) {
    filters.push(Q.where('status', params.status));
  }

  const search = params?.search?.trim() ?? '';
  if (search) {
    const like = `%${Q.sanitizeLikeString(search)}%`;
    filters.push(
      Q.or(
        Q.where('customer_name', Q.like(like)),
        Q.where('customer_phone', Q.like(like))
      )
    );
  }

  return database
    .get<Order>('orders')
    .query(...filters)
    .observe();
}

export function fetchOrderItemsObservable(orderId: string) {
  return database
    .get<OrderItem>('order_items')
    .query(
      Q.where('order_id', orderId),
      Q.sortBy('created_at', Q.desc)
    )
    .observe();
}
