import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { getAllIncidents } from '../../database/repositories/incidentRepository';
import { useAppStore } from '../../store/store';
import { Incident } from '../../types/incident';
import { Device } from '../../types/device';

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + '\n'
    + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(start: number, end?: number | null): string {
  if (!end) return 'Ongoing';
  const mins = Math.round((end - start) / 60000);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    freezer: 'Freezer', fridge: 'Fridge',
    cold_room: 'Cold Room', general: 'General',
  };
  return map[cat] ?? cat;
}

type Row = Incident & { deviceName: string; deviceCategory: string };

export default function IncidentsScreen({ navigation }: any) {
  const devices = useAppStore(s => s.devices);
  const [incidents, setIncidents] = useState<Row[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllIncidents()
      .then(data => {
        const deviceMap = new Map<string, Device>(devices.map(d => [d.device_id, d]));
        const rows: Row[] = data.map(inc => {
          const dev = deviceMap.get(inc.device_id);
          return {
            ...inc,
            deviceName: dev?.name ?? inc.device_id,
            deviceCategory: dev?.category ?? '',
          };
        });
        setIncidents(rows);
      })
      .catch(console.error);
  }, [devices]);

  const filtered = useMemo(() => {
    if (!search.trim()) return incidents;
    const q = search.toLowerCase();
    return incidents.filter(r =>
      r.deviceName.toLowerCase().includes(q) ||
      r.deviceCategory.toLowerCase().includes(q)
    );
  }, [incidents, search]);

  const exportAs = (format: 'PDF' | 'Excel') => {
    if (filtered.length === 0) {
      Alert.alert('No Data', 'No incidents to export.');
      return;
    }
    Alert.alert(
      `Export ${format}`,
      `${filtered.length} incident(s) ready for export.\n\n(Requires expo-print & expo-sharing for production.)`,
      [{ text: 'OK' }]
    );
  };

  const renderHeader = () => (
    <View>
      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search incidents..."
          placeholderTextColor="#B0B8C8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Recent Activity + Export */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.exportRow}>
        <TouchableOpacity style={styles.exportBtn} onPress={() => exportAs('PDF')} activeOpacity={0.85}>
          <Text style={styles.exportIcon}>📄</Text>
          <Text style={styles.exportText}>Export as PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.exportBtn, styles.exportBtnSecondary]} onPress={() => exportAs('Excel')} activeOpacity={0.85}>
          <Text style={styles.exportIcon}>📊</Text>
          <Text style={styles.exportText}>Export as Excel</Text>
        </TouchableOpacity>
      </View>

      {/* Table header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.colHead, styles.colDevice]}>DEVICE</Text>
        <Text style={[styles.colHead, styles.colTime]}>TIME{'\n'}STAMP</Text>
        <Text style={[styles.colHead, styles.colCat]}>CATEGORY</Text>
        <Text style={[styles.colHead, styles.colDur]}>DURATION</Text>
      </View>
      <View style={styles.divider} />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyIcon}>⚠️</Text>
      <Text style={styles.emptyText}>No incidents recorded yet</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incidents</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => `${item.incident_id ?? i}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
            <Text style={[styles.cell, styles.colDevice]} numberOfLines={2}>{item.deviceName}</Text>
            <Text style={[styles.cell, styles.colTime]}>{formatTimestamp(item.start_time)}</Text>
            <Text style={[styles.cell, styles.colCat]}>{categoryLabel(item.deviceCategory)}</Text>
            <Text style={[styles.cell, styles.colDur]}>{formatDuration(item.start_time, item.end_time)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6FB' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0E0E0',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F6FB',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: '#1C1C1E' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },

  list: { paddingBottom: 32 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 11, margin: 16, marginBottom: 8,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14, color: '#1C1C1E' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', marginHorizontal: 16, marginBottom: 10 },

  exportRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 16 },
  exportBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#5C6BC0', borderRadius: 12, paddingVertical: 13,
    shadowColor: '#5C6BC0', shadowOpacity: 0.3, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  exportBtnSecondary: { backgroundColor: '#7C3AED' },
  exportIcon: { fontSize: 15 },
  exportText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Table
  tableHeader: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#F4F6FB',
  },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 16 },
  colHead: { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 0.4 },
  tableRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14 },
  tableRowAlt: { backgroundColor: '#F8F9FF' },
  cell: { fontSize: 13, color: '#1C1C1E', lineHeight: 18 },

  // Column widths
  colDevice: { flex: 2 },
  colTime: { flex: 2.2 },
  colCat: { flex: 2 },
  colDur: { flex: 1.5, textAlign: 'right' },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});
