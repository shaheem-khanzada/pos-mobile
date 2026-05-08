import type Order from '@/database/model/Order';
import type { Cart } from '@/payload/types';

import type { OrderListItem, OrderStatus, PaymentMethod } from './types';

export function cartStatusToOrderStatus(status: Cart['status']): OrderStatus {
  if (status === 'purchased') return 'completed';
  if (status === 'abandoned') return 'cancelled';
  return 'pending';
}

export function paymentMethodToListPayment(method: Cart['paymentMethod']): PaymentMethod {
  if (method === 'online') return 'Card';
  return 'Cash';
}

export function formatOrderListTimeLabel(createdAt: string): string {
  const d = new Date(createdAt);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);
  const t = d.getTime();
  if (t >= startToday.getTime()) {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  if (t >= startYesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Short order number for list rows and receipts (last 4 hex chars of id). */
export function cartOrderNumberLabel(cart: Pick<Cart, 'id'> | Pick<Order, 'id'>): string {
  const hex = cart.id.replace(/[^a-f0-9]/gi, '');
  if (hex.length >= 4) return hex.slice(-4).toUpperCase();
  return cart.id.slice(0, 6).toUpperCase();
}

/** Amount charged: line subtotal minus order discount. */
export function orderChargedTotal(
  subtotal: number | null | undefined,
  discount: number | null | undefined
): number {
  const s = subtotal ?? 0;
  const d = discount ?? 0;
  return Math.max(0, s - d);
}

/** UI-boundary mapping: Payload `Cart` → list row model. */
export function mapCartToOrderListItem(cart: Cart): OrderListItem {
  return {
    id: cart.id,
    orderNumber: cartOrderNumberLabel(cart),
    timeLabel: formatOrderListTimeLabel(cart.createdAt),
    status: cartStatusToOrderStatus(cart.status),
    customerName: cart.customerName,
    payment: paymentMethodToListPayment(cart.paymentMethod),
    total: orderChargedTotal(cart.subtotal, cart.discount),
  };
}

/** UI-boundary mapping: Watermelon `Order` → list row model. */
export function mapOrderModelToOrderListItem(order: Order): OrderListItem {
  return {
    id: order.id,
    orderNumber: cartOrderNumberLabel(order),
    timeLabel: formatOrderListTimeLabel(order.createdAt.toISOString()),
    status: cartStatusToOrderStatus(order.status as Cart['status']),
    customerName: order.customerName,
    payment: paymentMethodToListPayment(order.paymentMethod),
    total: orderChargedTotal(order.subtotal, order.discount),
  };
}

/** Count of orders whose `createdAt` falls on the local calendar day (starts midnight). */
export function countOrdersCreatedToday(orders: Order[]): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const t0 = start.getTime();
  return orders.filter((o) => o.createdAt.getTime() >= t0).length;
}
