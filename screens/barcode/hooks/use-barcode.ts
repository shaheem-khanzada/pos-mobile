import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useBarcodeStore } from '@/screens/barcode/stores/barcode-store';

export function useBarcode() {
  const router = useRouter();
  const scannedBarcode = useBarcodeStore((s) => s.scannedBarcode);
  const scannedAt = useBarcodeStore((s) => s.scannedAt);
  const setScannedBarcode = useBarcodeStore((s) => s.setScannedBarcode);
  const clearScannedBarcode = useBarcodeStore((s) => s.clearScannedBarcode);

  const openBarcodeScanner = useCallback(
    (options?: { multi?: boolean }) => {
      if (options?.multi) {
        router.push({
          pathname: '/tabs/barcode-scanner',
          params: { multi: '1' },
        });
        return;
      }
      router.push('/tabs/barcode-scanner');
    },
    [router]
  );

  return {
    scannedBarcode,
    scannedAt,
    setScannedBarcode,
    clearScannedBarcode,
    openBarcodeScanner,
  };
}

