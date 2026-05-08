import type { DiscoveredBlePrinter } from '@/screens/printers/utils/ble-printer';

/**
 * BLE stack only exposes id + name; infer a human-readable printer category for the subtitle row.
 * All discovered devices here are printers (BLE receipt / label path).
 */
export function printerDeviceTypeLabel(device: DiscoveredBlePrinter): string {
  const raw = device.name.trim();
  const n = raw.toLowerCase();

  if (n.includes('label')) {
    return 'Printer · Label';
  }
  if (
    n.includes('mobile') ||
    n.includes('pocket') ||
    n.includes('mini') ||
    n.includes('handheld') ||
    /^rpp\d/i.test(raw)
  ) {
    return 'Printer · Mobile';
  }
  if (n.includes('receipt') || n.includes('thermal') || n.includes('pos') || n.includes('ticket')) {
    return 'Printer · Receipt';
  }
  if (n.includes('kitchen') || n.includes('impact')) {
    return 'Printer · Kitchen';
  }

  return 'Printer · Bluetooth';
}
