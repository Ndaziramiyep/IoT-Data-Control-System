// Placeholder — integrate with react-native-ble-plx or expo-bluetooth when available
export interface BleDevice {
  id: string;
  name: string | null;
  rssi: number;
}

type ScanCallback = (device: BleDevice) => void;

let scanning = false;

export function startScan(onDevice: ScanCallback): void {
  if (scanning) return;
  scanning = true;
  // TODO: implement BLE scanning
  console.log('BLE scan started');
}

export function stopScan(): void {
  scanning = false;
  console.log('BLE scan stopped');
}

export async function readTemperature(deviceId: string): Promise<number> {
  // TODO: read characteristic from BLE device
  return Promise.resolve(0);
}
