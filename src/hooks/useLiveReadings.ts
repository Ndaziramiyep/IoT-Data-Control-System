import { useState, useEffect } from 'react';
import { Reading } from '../types/reading';
import { getReadings } from '../services/cacheService';

export function useLiveReadings(deviceId: string) {
  const [readings, setReadings] = useState<Reading[]>([]);

  useEffect(() => {
    setReadings(getReadings(deviceId));
    const interval = setInterval(() => setReadings(getReadings(deviceId)), 5000);
    return () => clearInterval(interval);
  }, [deviceId]);

  return { readings };
}
