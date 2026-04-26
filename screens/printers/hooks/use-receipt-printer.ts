import { useCallback, useState } from 'react';

import type { Cart } from '@/payload/types';
import { printOrderReceipt } from '@/screens/printers/utils/print-order-receipt';
import { usePrinterStore } from '@/screens/printers/store';
import { setToast } from '@/toast/store';

export function useReceiptPrinter() {
  const [printingKey, setPrintingKey] = useState<string | null>(null);
  const hasDefaultPrinter = usePrinterStore((s) => Boolean(s.defaultPrinter));

  const printCart = useCallback(async (cart: Cart, key: string) => {
    if (!usePrinterStore.getState().defaultPrinter) {
      setToast({
        variant: 'warning',
        title: 'No printer',
        description: 'Choose a receipt printer under Profile → Manage Printers.',
      });
      return false;
    }
    setPrintingKey(key);
    try {
      await printOrderReceipt(cart);
      return true;
    } catch {
      return false;
    } finally {
      setPrintingKey(null);
    }
  }, []);

  return {
    hasDefaultPrinter,
    printingKey,
    printCart,
  };
}
