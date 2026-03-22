import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';
import DeviceConfigForm from '../../components/device/DeviceConfigForm';
import { insertDevice } from '../../database/repositories/deviceRepository';
import { useAppStore } from '../../store/store';
import { Device } from '../../types/device';

export default function DeviceConfigScreen({ navigation, route }: any) {
  const addDevice = useAppStore(s => s.addDevice);
  const scanned = route.params?.scannedDevice as { name: string; macAddress: string; category?: string } | undefined;

  const handleSubmit = async (name: string, minTemp: number, maxTemp: number) => {
    const device: Device = {
      id: Date.now().toString(),
      name,
      category: (scanned?.category as Device['category']) ?? 'freezer',
      macAddress: scanned?.macAddress ?? '',
      minTemp,
      maxTemp,
      createdAt: Date.now(),
    };
    await insertDevice(device);
    addDevice(device);
    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <Header title="Configure Device" />
      <View style={styles.body}>
        <DeviceConfigForm
          initialName={scanned?.name}
          onSubmit={handleSubmit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { padding: 20 },
});
