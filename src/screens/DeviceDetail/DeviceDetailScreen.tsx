import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';
import DeviceDetailCard from '../../components/device/DeviceDetailCard';
import TemperatureGraph from '../../components/graph/TemperatureGraph';
import { useDevices } from '../../hooks/useDevices';
import { useLiveReadings } from '../../hooks/useLiveReadings';

export default function DeviceDetailScreen({ route }: any) {
  const { deviceId } = route.params;
  const { devices } = useDevices();
  const { readings } = useLiveReadings(deviceId);
  const device = devices.find(d => d.id === deviceId);

  if (!device) return null;

  return (
    <View style={styles.container}>
      <Header title={device.name} />
      <View style={styles.body}>
        <DeviceDetailCard device={device} currentTemp={readings[0]?.temperature} />
        <TemperatureGraph readings={readings} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { padding: 16, gap: 16 },
});
