import { Device } from '../../types/device';

export interface DeviceSlice {
  devices: Device[];
  setDevices: (devices: Device[]) => void;
  addDevice: (device: Device) => void;
  removeDevice: (id: string) => void;
}

export const createDeviceSlice = (set: any): DeviceSlice => ({
  devices: [],
  setDevices: (devices) => set({ devices }),
  addDevice: (device) => set((s: any) => ({ devices: [...s.devices, device] })),
  removeDevice: (id) => set((s: any) => ({ devices: s.devices.filter((d: Device) => d.id !== id) })),
});
