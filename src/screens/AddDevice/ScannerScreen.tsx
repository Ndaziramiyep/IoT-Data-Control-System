import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';

export default function ScannerScreen() {
  return (
    <View style={styles.container}>
      <Header title="Scan Devices" />
      <Text style={styles.hint}>Scanning for nearby Bluetooth devices…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hint: { margin: 20, color: '#666' },
});
