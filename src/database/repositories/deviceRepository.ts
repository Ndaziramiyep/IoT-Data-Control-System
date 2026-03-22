import { getDb } from '../db';
import { Device } from '../../types/device';

export async function getAllDevices(): Promise<Device[]> {
  return getDb().getAllAsync<Device>('SELECT * FROM devices ORDER BY createdAt DESC');
}

export async function insertDevice(device: Device): Promise<void> {
  const { id, name, category, macAddress, minTemp, maxTemp, createdAt } = device;
  await getDb().runAsync(
    'INSERT INTO devices (id, name, category, macAddress, minTemp, maxTemp, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, category, macAddress, minTemp, maxTemp, createdAt]
  );
}

export async function deleteDevice(id: string): Promise<void> {
  await getDb().runAsync('DELETE FROM devices WHERE id = ?', [id]);
}
