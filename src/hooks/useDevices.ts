import { useEffect } from 'react';
import { useAppStore } from '../store/store';
import { getAllDevices } from '../database/repositories/deviceRepository';

export function useDevices() {
  const devices = useAppStore(s => s.devices);
  const setDevices = useAppStore(s => s.setDevices);

  useEffect(() => {
    getAllDevices().then(setDevices);
  }, []);

  return { devices };
}
