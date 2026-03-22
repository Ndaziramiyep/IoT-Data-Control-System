import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';
import FreezerSection from './Sections/FreezerSection';
import FridgeSection from './Sections/FridgeSection';
import ColdRoomSection from './Sections/ColdRoomSection';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <Header title="Dashboard" />
      <FreezerSection />
      <FridgeSection />
      <ColdRoomSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
});
