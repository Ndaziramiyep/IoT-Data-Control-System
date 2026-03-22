export type DeviceCategory = 'freezer' | 'fridge' | 'cold_room';

export interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  macAddress: string;
  minTemp: number;
  maxTemp: number;
  createdAt: number;
}
