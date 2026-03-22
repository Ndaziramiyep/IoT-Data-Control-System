import { Device } from '../types/device';
import { Reading } from '../types/reading';
import { Incident } from '../types/incident';
import { insertIncident } from '../database/repositories/incidentRepository';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';

export async function checkThreshold(device: Device, reading: Reading): Promise<void> {
  const { temperature } = reading;
  let message: string | null = null;

  if (temperature > device.maxTemp) {
    message = `Temperature ${temperature}°C exceeds max ${device.maxTemp}°C`;
  } else if (temperature < device.minTemp) {
    message = `Temperature ${temperature}°C is below min ${device.minTemp}°C`;
  }

  if (message) {
    const incident: Incident = {
      id: uuid(),
      deviceId: device.id,
      message,
      severity: 'high',
      timestamp: Date.now(),
      resolved: false,
    };
    await insertIncident(incident);
  }
}
