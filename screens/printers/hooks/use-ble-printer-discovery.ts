import { useCallback, useState } from 'react';

import {
  DiscoveredBlePrinter,
  scanBlePrinters,
} from '@/screens/printers/utils/ble-printer';

export function useBlePrinterDiscovery() {
  const [printers, setPrinters] = useState<DiscoveredBlePrinter[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const scan = useCallback(async (timeoutMs = 9000) => {
    setIsScanning(true);
    setScanError(null);
    try {
      const devices = await scanBlePrinters(timeoutMs);
      setPrinters(devices);
      return devices;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setScanError(message || 'Could not scan BLE printers.');
      return [];
    } finally {
      setIsScanning(false);
    }
  }, []);

  return {
    printers,
    isScanning,
    scanError,
    scan,
  };
}
