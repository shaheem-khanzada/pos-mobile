import type { Cart } from '@/payload/types';

import type { OrderListItem, OrderStatus, PaymentMethod } from './types';

function cartStatusToOrderStatus(status: Cart['status']): OrderStatus {
  if (status === 'purchased') return 'completed';
  if (status === 'abandoned') return 'cancelled';
  return 'pending';
}

function paymentMethodToListPayment(method: Cart['paymentMethod']): PaymentMethod {
  if (method === 'online') return 'Card';
  return 'Cash';
}

function formatTimeLabel(createdAt: string): string {
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
export function cartOrderNumberLabel(cart: Pick<Cart, 'id'>): string {
  const hex = cart.id.replace(/[^a-f0-9]/gi, '');
  if (hex.length >= 4) return hex.slice(-4).toUpperCase();
  return cart.id.slice(0, 6).toUpperCase();
}

/** UI-boundary mapping: Payload `Cart` → list row model. */
export function mapCartToOrderListItem(cart: Cart): OrderListItem {
  return {
    id: cart.id,
    orderNumber: cartOrderNumberLabel(cart),
    timeLabel: formatTimeLabel(cart.createdAt),
    status: cartStatusToOrderStatus(cart.status),
    customerName: cart.customerName,
    payment: paymentMethodToListPayment(cart.paymentMethod),
    total: cart.subtotal ?? 0,
  };
}
