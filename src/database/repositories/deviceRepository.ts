import { getReadyDb, webLoadDevices, webSaveDevices } from '../db';
import { Device } from '../../types/device';
import { Platform } from 'react-native';

export async function getAllDevices(): Promise<Device[]> {
  if (Platform.OS === 'web') return webLoadDevices() as Device[];
  const db = await getReadyDb();
  if (!db) return [];
  return db.getAllAsync<Device>('SELECT * FROM devices ORDER BY created_at DESC');
}

export async function insertDevice(device: Device): Promise<void> {
  if (Platform.OS === 'web') {
    const existing = webLoadDevices() as Device[];
    const duplicate = existing.find(
      d => d.mac_address.toUpperCase() === device.mac_address.toUpperCase()
    );
    if (duplicate) throw new Error('DUPLICATE_MAC');
    webSaveDevices([...existing, device]);
    return;
  }
  const db = await getReadyDb();
  if (!db) return;
  const { device_id, name, category, mac_address, temp_low_threshold, temp_high_threshold, battery_level, last_sync, created_at } = device;
  await db.runAsync(
    `INSERT INTO devices
      (device_id, name, category, mac_address, temp_low_threshold, temp_high_threshold, battery_level, last_sync, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    device_id, name, category, mac_address,
    temp_low_threshold, temp_high_threshold,
    battery_level ?? null, last_sync ?? null, created_at
  );
}

export async function deleteDevice(device_id: string): Promise<void> {
  if (Platform.OS === 'web') {
    const existing = webLoadDevices() as Device[];
    webSaveDevices(existing.filter(d => d.device_id !== device_id));
    return;
  }
  const db = await getReadyDb();
  if (!db) return;
  await db.runAsync('DELETE FROM devices WHERE device_id = ?', device_id);
}

export async function updateDeviceSync(device_id: string, last_sync: number, battery_level?: number): Promise<void> {
  if (Platform.OS === 'web') {
    const existing = webLoadDevices() as Device[];
    webSaveDevices(existing.map(d =>
      d.device_id === device_id ? { ...d, last_sync, battery_level: battery_level ?? d.battery_level } : d
    ));
    return;
  }
  const db = await getReadyDb();
  if (!db) return;
  await db.runAsync(
    'UPDATE devices SET last_sync = ?, battery_level = ? WHERE device_id = ?',
    last_sync, battery_level ?? null, device_id
  );
}
