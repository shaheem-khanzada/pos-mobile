import { fromByteArray } from 'base64-js';
import {
  BleManager,
  Device,
  State,
  Subscription,
} from 'react-native-ble-plx';

let manager: BleManager | null = null;
let printQueue: Promise<void> = Promise.resolve();
const writeTargetCache = new Map<string, BleWriteTarget>();

function getManager() {
  if (!manager) manager = new BleManager();
  return manager;
}

export type DiscoveredBlePrinter = {
  id: string;
  name: string;
};

type BleWriteTarget = {
  serviceUUID: string;
  characteristicUUID: string;
  withoutResponse: boolean;
};

function toAsciiBytes(text: string): Uint8Array {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) out[i] = text.charCodeAt(i) & 0xff;
  return out;
}

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const len = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(len);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPoweredOn(): Promise<void> {
  const m = getManager();
  const current = await m.state();
  if (current === State.PoweredOn) return;
  await new Promise<void>((resolve, reject) => {
    let sub: Subscription | null = null;
    sub = m.onStateChange((next) => {
      if (next === State.PoweredOn) {
        sub?.remove();
        resolve();
      }
    }, true);
    setTimeout(() => {
      sub?.remove();
      reject(new Error('Bluetooth is not powered on.'));
    }, 10000);
  });
}

async function hasWritableWithResponse(deviceId: string): Promise<boolean> {
  const m = getManager();
  await m.cancelDeviceConnection(deviceId).catch(() => {});
  try {
    const connected = await m.connectToDevice(deviceId, { timeout: 6000 });
    const device = await connected.discoverAllServicesAndCharacteristics();
    const services = await m.servicesForDevice(device.id);
    for (const service of services) {
      const chars = await m.characteristicsForDevice(device.id, service.uuid);
      if (chars.some((c) => c.isWritableWithResponse)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  } finally {
    await m.cancelDeviceConnection(deviceId).catch(() => {});
  }
}

export async function scanBlePrinters(
  timeoutMs = 8000
): Promise<DiscoveredBlePrinter[]> {
  const m = getManager();
  await waitForPoweredOn();
  const seen = new Map<string, DiscoveredBlePrinter>();

  return new Promise<DiscoveredBlePrinter[]>((resolve, reject) => {
    m.startDeviceScan(null, null, (err, device) => {
      if (err) {
        m.stopDeviceScan();
        reject(err);
        return;
      }
      if (!device) return;
      const rawName = (device.name || device.localName || '').trim();
      if (!rawName) return;
      const name = rawName;
      if (!seen.has(device.id)) {
        seen.set(device.id, { id: device.id, name });
      }
    });

    setTimeout(() => {
      m.stopDeviceScan();
      void (async () => {
        const discovered = Array.from(seen.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        const supported: DiscoveredBlePrinter[] = [];
        for (const d of discovered) {
          const ok = await hasWritableWithResponse(d.id);
          if (ok) supported.push(d);
        }
        resolve(supported);
      })();
    }, timeoutMs);
  });
}

async function findWritableCandidates(device: Device): Promise<BleWriteTarget[]> {
  const m = getManager();
  const services = await m.servicesForDevice(device.id);

  const candidates: (BleWriteTarget & { score: number })[] = [];

  for (const service of services) {
    const chars = await m.characteristicsForDevice(device.id, service.uuid);
    for (const c of chars) {
      if (!c.isWritableWithResponse && !c.isWritableWithoutResponse) continue;
      let score = c.isWritableWithResponse ? 40 : 20;
      candidates.push({
        serviceUUID: service.uuid,
        characteristicUUID: c.uuid,
        withoutResponse: Boolean(c.isWritableWithoutResponse && !c.isWritableWithResponse),
        score,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.map(({ score: _score, ...target }) => target);
}

async function connectAndResolveTargets(deviceId: string): Promise<{
  device: Device;
  targets: BleWriteTarget[];
}> {
  const m = getManager();
  // Clear stale sessions; some small thermal printers get stuck after repeated jobs.
  await m.cancelDeviceConnection(deviceId).catch(() => {});

  const connected = await m.connectToDevice(deviceId, { timeout: 10000 });
  const device = await connected.discoverAllServicesAndCharacteristics();
  await sleep(120);
  const targets = await findWritableCandidates(device);
  if (targets.length > 0) {
    return { device, targets };
  }

  await m.cancelDeviceConnection(device.id).catch(() => {});
  throw new Error('No writable BLE characteristic found on this printer.');
}

async function writePayloadWithTarget(
  deviceId: string,
  target: BleWriteTarget,
  payload: Uint8Array
): Promise<void> {
  const m = getManager();
  const chunkSize = 180;
  const interChunkDelayMs = 14;
  const maxChunkRetries = 1;

  for (let i = 0; i < payload.length; i += chunkSize) {
    const chunk = payload.slice(i, i + chunkSize);
    const b64 = fromByteArray(chunk);
    let retries = 0;
    while (true) {
      try {
        if (target.withoutResponse) {
          await m.writeCharacteristicWithoutResponseForDevice(
            deviceId,
            target.serviceUUID,
            target.characteristicUUID,
            b64
          );
          // Without-response writes can be dropped if sent too quickly.
          await sleep(interChunkDelayMs);
        } else {
          await m.writeCharacteristicWithResponseForDevice(
            deviceId,
            target.serviceUUID,
            target.characteristicUUID,
            b64
          );
        }
        break;
      } catch (e) {
        if (retries >= maxChunkRetries) throw e;
        retries += 1;
        await sleep(45);
      }
    }
  }
}

async function runPrint(deviceId: string, text: string): Promise<void> {
  const m = getManager();
  const escCut = new Uint8Array([0x1d, 0x56, 0x00]);
  const payload = concatBytes(toAsciiBytes(text), toAsciiBytes('\n\n'), escCut);
  const { device, targets } = await connectAndResolveTargets(deviceId);
  const cached = writeTargetCache.get(deviceId);
  const orderedTargets = cached
    ? [cached, ...targets.filter((t) => !(t.serviceUUID === cached.serviceUUID && t.characteristicUUID === cached.characteristicUUID))]
    : targets;

  let lastError: unknown = null;
  try {
    for (const target of orderedTargets) {
      try {
        await writePayloadWithTarget(device.id, target, payload);
        writeTargetCache.set(deviceId, target);
        return;
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Failed to write receipt payload.');
  } finally {
    await m.cancelDeviceConnection(device.id).catch(() => {});
  }
}

/** Serializes print jobs to avoid concurrent BLE writes. */
export async function printBleReceipt(deviceId: string, text: string): Promise<void> {
  const run = async () => {
    await waitForPoweredOn();
    await runPrint(deviceId, text);
  };
  const job = printQueue.then(run, run);
  printQueue = job.catch(() => {});
  return job;
}
