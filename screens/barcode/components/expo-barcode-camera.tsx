import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BarcodeScanningResult,
  CameraType,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { Text } from '@/components/ui/text';

type ExpoBarcodeCameraProps = {
  onScanned: (value: string) => void;
  /** When true, preview is paused and barcode events are ignored until cleared. */
  paused?: boolean;
};

export function ExpoBarcodeCamera({ onScanned, paused = false }: ExpoBarcodeCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<InstanceType<typeof CameraView>>(null);

  useEffect(() => {
    if (!permission?.granted) void requestPermission();
  }, [permission?.granted, requestPermission]);

  useEffect(() => {
    const cam = cameraRef.current;
    if (!cam) return;
    if (paused) {
      void cam.pausePreview();
    } else {
      void cam.resumePreview();
    }
  }, [paused]);

  const onBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (paused) return;
      const value = (result.data ?? '').trim();
      if (value) onScanned(value);
    },
    [onScanned, paused]
  );

  if (!permission?.granted) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.centered]}>
        <Text>Camera permission is required to scan barcodes.</Text>
      </View>
    );
  }

  return (
    <CameraView
      ref={cameraRef}
      style={StyleSheet.absoluteFillObject}
      facing={'back' as CameraType}
      active={!paused}
      barcodeScannerSettings={{
        barcodeTypes: [
          'qr',
          'ean13',
          'ean8',
          'code128',
          'code39',
          'code93',
          'itf14',
          'codabar',
          'upc_a',
          'upc_e',
          'datamatrix',
          'aztec',
          'pdf417',
        ],
      }}
      onBarcodeScanned={onBarcodeScanned}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});

