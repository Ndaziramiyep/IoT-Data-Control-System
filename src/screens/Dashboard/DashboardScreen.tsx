import React, { useEffect } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { useDevices } from '../../hooks/useDevices';
import { useLiveReadings } from '../../hooks/useLiveReadings';
import { Device, DeviceCategory } from '../../types/device';
import { formatTemperature } from '../../utils/formatters';

const { width } = Dimensions.get('window');
const GRAPH_W = width - 48;
const GRAPH_H = 80;

// ── Sparkline (pure RN, no library) ──────────────────────────────────────────
function Sparkline({ data, color = '#5C6BC0', threshold }: { data: number[]; color?: string; threshold?: number }) {
  if (data.length < 2) return <View style={{ height: GRAPH_H }} />;
  const min = Math.min(...data) - 2;
  const max = Math.max(...data) + 2;
  const range = max - min || 1;
  const step = GRAPH_W / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * step,
    y: GRAPH_H - ((v - min) / range) * GRAPH_H,
  }));

  const thresholdY = threshold !== undefined
    ? GRAPH_H - ((threshold - min) / range) * GRAPH_H
    : null;

  return (
    <View style={{ width: GRAPH_W, height: GRAPH_H }}>
      {/* Threshold dashed line */}
      {thresholdY !== null && thresholdY >= 0 && thresholdY <= GRAPH_H && (
        <View style={[styles.threshLine, { top: thresholdY }]} />
      )}
      {/* Line segments */}
      {points.slice(0, -1).map((p, i) => {
        const next = points[i + 1];
        const dx = next.x - p.x;
        const dy = next.y - p.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: len,
              height: 2,
              backgroundColor: color,
              transformOrigin: '0 50%',
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}
    </View>
  );
}

// ── Device card ───────────────────────────────────────────────────────────────
function DeviceCard({ device }: { device: Device }) {
  const { readings } = useLiveReadings(device.id);
  const temp = readings[0]?.temperature ?? (Math.random() * 10 - 25); // demo fallback
  const trend = readings.length > 1 ? readings[0].temperature - readings[1].temperature : 0;

  return (
    <View style={styles.deviceCard}>
      <View style={styles.deviceCardRow}>
        <View style={styles.dot} />
        <Text style={styles.deviceName}>{device.name}</Text>
      </View>
      <Text style={styles.deviceTemp}>{formatTemperature(temp)}</Text>
      <Text style={styles.deviceTrend}>{trend >= 0 ? `▲ ${trend.toFixed(1)}%` : `▼ ${Math.abs(trend).toFixed(1)}%`}</Text>
    </View>
  );
}

// ── Category section ──────────────────────────────────────────────────────────
function CategorySection({ label, range, devices }: { label: string; range: string; devices: Device[] }) {
  const mockData = [
    -18, -19, -17, -20, -18.5, -19.2, -18, -17.5, -19, -18.2,
    -17, -18.8, -19.5, -18, -17.2, -19, -18.5, -17.8, -19.2, -18,
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{label}</Text>
          <Text style={styles.sectionRange}>{range}</Text>
        </View>
        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeText}>{devices.length} Active</Text>
        </View>
      </View>

      {/* Device cards grid */}
      <View style={styles.cardGrid}>
        {devices.map(d => <DeviceCard key={d.id} device={d} />)}
      </View>

      {/* Graph */}
      <View style={styles.graphWrap}>
        <Sparkline data={mockData} color="#5C6BC0" threshold={-17} />
        <View style={styles.graphLegend}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} /><Text style={styles.legendText}>High Threshold</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} /><Text style={styles.legendText}>Low Threshold</Text></View>
          {devices.slice(0, 2).map((d, i) => (
            <View key={d.id} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: i === 0 ? '#5C6BC0' : '#8B5CF6' }]} />
              <Text style={styles.legendText}>{d.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }: any) {
  const { devices } = useDevices();
  const isEmpty = devices.length === 0;

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: isEmpty ? { display: 'none' } : undefined,
    });
  }, [isEmpty]);

  const byCategory = (cat: DeviceCategory) => devices.filter(d => d.category === cat);
  const freezers = byCategory('freezer');
  const fridges = byCategory('fridge');
  const coldRooms = byCategory('cold_room');

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Image source={require('../../../assets/Kumva-New-Logo-D.png')} style={styles.logoImg} resizeMode="contain" />
        <Text style={styles.appTitle}>Kumva Insights</Text>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconBtn}><Text style={styles.iconBtnText}>🔔</Text></TouchableOpacity>
        </View>
      </View>

      {/* Empty state */}
      {isEmpty ? (
        <View style={styles.emptyWrap}>
          <View style={styles.iconCircle}>
            <View style={styles.noSignal}>
              <View style={styles.diagLine} />
              <View style={[styles.arc, { width: 52, height: 52, borderRadius: 26, top: 14, left: 14 }]} />
              <View style={[styles.arc, { width: 34, height: 34, borderRadius: 17, top: 23, left: 23 }]} />
              <View style={[styles.arc, { width: 16, height: 16, borderRadius: 8, top: 32, left: 32 }]} />
            </View>
          </View>
          <Text style={styles.emptyTitle}>No devices added yet</Text>
          <Text style={styles.emptySubtitle}>
            Start monitoring your storage environment{'\n'}
            by connecting your first BLE sensor. Track{'\n'}
            incidents and  view real-time data.
          </Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddDevice')} activeOpacity={0.85}>
            <Text style={styles.addBtnIcon}>⊕</Text>
            <Text style={styles.addBtnText}>Add Device</Text>
          </TouchableOpacity>
          <Text style={styles.footer}>CONNECTED INFRASTRUCTURE STARTS HERE</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {freezers.length > 0 && (
            <CategorySection label="FREEZER" range="Range: -25 to 5°C" devices={freezers} />
          )}
          {fridges.length > 0 && (
            <CategorySection label="FRIDGE" range="Range: 2 to 8°C" devices={fridges} />
          )}
          {coldRooms.length > 0 && (
            <CategorySection label="COLD ROOM" range="Range: 0 to 10°C" devices={coldRooms} />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB' },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0E0E0',
  },
  appTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  logoImg: { width: 52, height: 36 },
  topBarIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F6FB', alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 18 },

  scroll: { padding: 16, gap: 16, paddingBottom: 32 },

  // ── Section ──
  section: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1C1C1E', letterSpacing: 0.5 },
  sectionRange: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF0FB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  activeText: { fontSize: 11, color: '#5C6BC0', fontWeight: '600' },

  // ── Device cards ──
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  deviceCard: { flex: 1, minWidth: '45%', backgroundColor: '#F8F9FF', borderRadius: 12, padding: 12 },
  deviceCardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  deviceName: { fontSize: 12, color: '#6B7280', fontWeight: '500', flex: 1 },
  deviceTemp: { fontSize: 22, fontWeight: '800', color: '#1C1C1E' },
  deviceTrend: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },

  // ── Graph ──
  graphWrap: { gap: 8 },
  threshLine: { position: 'absolute', left: 0, right: 0, height: 1, borderTopWidth: 1, borderColor: '#EF4444', borderStyle: 'dashed' },
  graphLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: '#9CA3AF' },

  // ── Empty state ──
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  iconCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#E8EAF6', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  noSignal: { width: 80, height: 80, position: 'relative' },
  diagLine: { position: 'absolute', width: 2, height: 90, backgroundColor: '#5C6BC0', top: -5, left: 39, transform: [{ rotate: '-45deg' }], zIndex: 2 },
  arc: { position: 'absolute', borderWidth: 3, borderColor: '#5C6BC0', borderBottomColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#5C6BC0', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32,
    width: '100%', marginTop: 8,
    shadowColor: '#5C6BC0', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  addBtnIcon: { color: '#fff', fontSize: 20 },
  addBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  footer: { fontSize: 10, color: '#9CA3AF', letterSpacing: 1.2, fontWeight: '600', marginTop: 8 },
});
