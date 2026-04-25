import { Alert } from 'react-native';

import type { Cart, CartItem } from '@/payload/types';
import { formatRs } from '@/lib/format-rs';
import { cartOrderNumberLabel } from '@/screens/orders/orders-list/map-cart-to-order-list-item';
import { cartItemTitle, cartItemUnitPrice } from '@/screens/orders/types';
import { usePrinterStore } from '@/screens/printers/store';
import { printBleReceipt } from './ble-printer';
const RECEIPT_WIDTH = 32;
const SHOP_NAME = 'POSH STORE';
const FOOTER_LINES = ['Thank you for shopping!', 'Please visit again'];

function paymentLabel(method: Cart['paymentMethod']): string {
  if (method === 'online') return 'Card / Online';
  return 'Cash';
}

function lineLabel(item: CartItem): string {
  try {
    return cartItemTitle(item);
  } catch {
    return 'Item';
  }
}

function unitPrice(item: CartItem): number {
  try {
    return cartItemUnitPrice(item);
  } catch {
    return 0;
  }
}

function buildReceiptText(cart: Cart): string {
  const lines: string[] = [];
  const divider = '-'.repeat(RECEIPT_WIDTH);

  const orderNo = cartOrderNumberLabel(cart);
  const created = new Date(cart.createdAt).toLocaleString();

  lines.push(centerText(SHOP_NAME, RECEIPT_WIDTH));
  lines.push(centerText('ORDER RECEIPT', RECEIPT_WIDTH));
  lines.push('');
  lines.push(rightPad(`Order #${orderNo}`, RECEIPT_WIDTH));
  lines.push(rightPad(created, RECEIPT_WIDTH));
  lines.push(rightPad(`Customer: ${cart.customerName}`, RECEIPT_WIDTH));
  lines.push(rightPad(`Payment: ${paymentLabel(cart.paymentMethod)}`, RECEIPT_WIDTH));
  lines.push(divider);
  lines.push(columns('Item', 'Total', RECEIPT_WIDTH));
  lines.push(divider);

  const items = cart.items ?? [];
  for (const row of items) {
    const qty = row.quantity ?? 0;
    const name = lineLabel(row);
    const up = unitPrice(row);
    const lineTotal = up * qty;
    lines.push(...wrapTextLines(name, RECEIPT_WIDTH));
    lines.push(columns(`${qty} x ${formatRs(up)}`, formatRs(lineTotal), RECEIPT_WIDTH));
  }

  lines.push(divider);
  lines.push(columns('SUBTOTAL', formatRs(cart.subtotal ?? 0), RECEIPT_WIDTH));
  lines.push('');
  for (const l of FOOTER_LINES) lines.push(centerText(l, RECEIPT_WIDTH));

  return lines.join('\n');
}

function centerText(text: string, width: number): string {
  const t = text.trim().slice(0, width);
  const pad = Math.max(0, Math.floor((width - t.length) / 2));
  return `${' '.repeat(pad)}${t}`;
}

function rightPad(text: string, width: number): string {
  const t = text.trim().slice(0, width);
  return t.padEnd(width, ' ');
}

function columns(left: string, right: string, width: number): string {
  const r = right.trim();
  const maxLeft = Math.max(1, width - r.length - 1);
  const l = left.trim().slice(0, maxLeft);
  return `${l}${' '.repeat(width - l.length - r.length)}${r}`;
}

function wrapTextLines(text: string, width: number): string[] {
  const words = text.trim().split(/\s+/);
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= width) {
      cur = next;
    } else {
      if (cur) out.push(cur);
      cur = w.length > width ? w.slice(0, width) : w;
    }
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * Prints a text receipt for a Payload `Cart` on the persisted default ESC/POS printer.
 */
export async function printOrderReceipt(cart: Cart): Promise<void> {
  const saved = usePrinterStore.getState().defaultPrinter;
  if (!saved) {
    Alert.alert(
      'No printer',
      'Choose a receipt printer under Profile → Manage Printers.'
    );
    return;
  }

  const body = buildReceiptText(cart);
  try {
    await printBleReceipt(saved.id, body);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    Alert.alert('Print failed', message);
    throw e;
  }
}
