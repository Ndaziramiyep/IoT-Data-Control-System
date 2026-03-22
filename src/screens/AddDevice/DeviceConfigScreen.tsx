import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';
import DeviceConfigForm from '../../components/device/DeviceConfigForm';

export default function DeviceConfigScreen({ navigation }: any) {
  const handleSubmit = (name: string, minTemp: number, maxTemp: number) => {
    // TODO: save device via deviceRepository
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <Header title="Configure Device" />
      <View style={styles.body}>
        <DeviceConfigForm onSubmit={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { padding: 20 },
});
