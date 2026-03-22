import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';
import { useIncidents } from '../../hooks/useIncidents';

export default function IncidentsScreen() {
  const { incidents } = useIncidents();

  return (
    <View style={styles.container}>
      <Header title="Incidents" />
      <FlatList
        data={incidents}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.device}>{item.deviceId}</Text>
            <Text style={styles.msg}>{item.message}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 8 },
  row: { backgroundColor: '#fff', padding: 12, borderRadius: 8 },
  device: { fontWeight: '600' },
  msg: { color: '#666', fontSize: 13 },
});
