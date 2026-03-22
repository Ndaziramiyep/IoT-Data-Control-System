import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { useDevices } from '../../hooks/useDevices';
import { getReadingsByDevice } from '../../database/repositories/readingRepository';
import { Device, DeviceCategory } from '../../types/device';
import { Reading } from '../../types/reading';

const { width } = Dimensions.get('window');
const GRAPH_W = width - 64;
const GRAPH_H = 100;
const COLORS = ['#5C6BC0', '#8B5CF6', '#06B6D4', '#F59E0B'];

const CATEGORY_RANGES: Record<DeviceCategory, string> = {
  freezer: 'Range: -20 to 0°C',
  fridge: 'Range: 2 to 8°C',
  cold_room: 'Range: 0 to 10°C',
  general: 'Range: 15 to 30°C',
};

// ── Multi-line graph ──────────────────────────────────────────────────────────
function MultiLineGraph({
  seriesData, colors, highThreshold, lowThreshold,
}: {
  seriesData: number[][];
  colors: string[];
  highThreshold: number;
  lowThreshold: number;
}) {
  const allValues = [...seriesData.flat(), highThreshold, lowThreshold];
  const minV = Math.min(...allValues) - 1;
  const maxV = Math.max(...allValues) + 1;
  const range = maxV - minV || 1;
  const toY = (v: number) => GRAPH_H - ((v - minV) / range) * GRAPH_H;
  const yLabels = [maxV, (maxV + minV) / 2, minV].map(v => Math.round(v));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      <View style={{ width: 28, height: GRAPH_H, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 4 }}>
        {yLabels.map((l, i) => <Text key={i} style={styles.axisLabel}>{l}°</Text>)}
      </View>
      <View style={{ width: GRAPH_W, height: GRAPH_H }}>
        <View style={[styles.threshLine, { top: toY(highThreshold), borderColor: '#EF4444' }]} />
        <View style={[styles.threshLine, { top: toY(lowThreshold), borderColor: '#3B82F6' }]} />
        {seriesData.map((data, si) => {
          if (data.length < 2) return null;
          const step = GRAPH_W / (data.length - 1);
          const points = data.map((v, i) => ({ x: i * step, y: toY(v) }));
          return points.slice(0, -1).map((p, i) => {
            const next = points[i + 1];
            const dx = next.x - p.x;
            const dy = next.y - p.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View
                key={`${si}-${i}`}
                style={{
                  position: 'absolute', left: p.x, top: p.y,
                  width: len, height: 2,
                  backgroundColor: colors[si] ?? '#5C6BC0',
                  transformOrigin: '0 50%',
                  transform: [{ rotate: `${angle}deg` }],
                }}
              />
            );
          });
        })}
      </View>
    </View>
  );
}

// ── Device card ───────────────────────────────────────────────────────────────
function DeviceCard({ device, lastTemp, hasReading }: { device: Device; lastTemp: number | null; hasReading: boolean }) {
  return (
    <View style={styles.deviceCard}>
      <View style={styles.deviceCardRow}>
        <Text style={styles.deviceName}>{device.name}</Text>
        <View style={[styles.dot, { backgroundColor: hasReading ? '#22C55E' : '#D1D5DB' }]} />
      </View>
      <Text style={styles.deviceTemp}>
        {lastTemp !== null ? `${lastTemp.toFixed(1)} °C` : '-- °C'}
      </Text>
      <Text style={styles.deviceMac}>{device.mac_address}</Text>
    </View>
  );
}

// ── Category section ──────────────────────────────────────────────────────────
function CategorySection({ category, devices, navigation }: { category: DeviceCategory; devices: Device[]; navigation: any }) {
  const [readingsMap, setReadingsMap] = useState<Record<string, Reading[]>>({});

  useEffect(() => {
    devices.forEach(d => {
      getReadingsByDevice(d.device_id, 20)
        .then(r => setReadingsMap(prev => ({ ...prev, [d.device_id]: r })))
        .catch(console.error);
    });
  }, [devices]);

  const label = category === 'cold_room' ? 'COLD ROOM' : category === 'general' ? 'GENERAL AREA' : category.toUpperCase();
  const range = CATEGORY_RANGES[category];
  const highThreshold = devices[0]?.temp_high_threshold ?? 0;
  const lowThreshold = devices[0]?.temp_low_threshold ?? -20;

  const seriesData = devices.map(d => {
    const r = readingsMap[d.device_id] ?? [];
    return [...r].reverse().map(x => x.temperature);
  });

  const lastTemps = devices.map(d => {
    const r = readingsMap[d.device_id];
    return r && r.length > 0 ? r[0].temperature : null;
  });

  // A device is "active" if it has a reading within the last 5 minutes
  const ACTIVE_WINDOW_MS = 5 * 60 * 1000;
  const activeCount = devices.filter(d => {
    const r = readingsMap[d.device_id];
    return r && r.length > 0 && Date.now() - r[0].timestamp < ACTIVE_WINDOW_MS;
  }).length;

  const hasGraphData = seriesData.some(s => s.length >= 2);

  const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const today = new Date().getDay();
  const xLabels = Array.from({ length: 7 }, (_, i) => DAY_LABELS[(today - 6 + i + 7) % 7]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{label}</Text>
          <Text style={styles.sectionRange}>{range}</Text>
        </View>
        {activeCount > 0 && (
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>{activeCount} Active</Text>
          </View>
        )}
      </View>

      <View style={styles.cardGrid}>
        {devices.map((d, i) => (
          <TouchableOpacity
            key={d.device_id}
            style={styles.deviceCard}
            onPress={() => navigation.navigate('DeviceDetail', { deviceId: d.device_id })}
            activeOpacity={0.8}
          >
            <View style={styles.deviceCardRow}>
              <Text style={styles.deviceName}>{d.name}</Text>
              <View style={[styles.dot, { backgroundColor: lastTemps[i] !== null ? '#22C55E' : '#D1D5DB' }]} />
            </View>
            <Text style={styles.deviceTemp}>
              {lastTemps[i] !== null ? `${lastTemps[i]!.toFixed(1)} °C` : '-- °C'}
            </Text>
            <Text style={styles.deviceMac}>{d.mac_address}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>{label}</Text>
        {hasGraphData ? (
          <>
            <MultiLineGraph
              seriesData={seriesData}
              colors={COLORS}
              highThreshold={highThreshold}
              lowThreshold={lowThreshold}
            />
            <View style={styles.xAxis}>
              <View style={{ width: 28 }} />
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                {xLabels.map(l => <Text key={l} style={styles.axisLabel}>{l}</Text>)}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noDataWrap}>
            <Text style={styles.noDataText}>No readings yet</Text>
          </View>
        )}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>High Threshold</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Low Threshold</Text>
          </View>
          {devices.slice(0, 2).map((d, i) => (
            <View key={d.device_id} style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: COLORS[i] }]} />
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

  const byCategory = (cat: DeviceCategory) => devices.filter(d => d.category === cat);
  const freezers = byCategory('freezer');
  const fridges = byCategory('fridge');
  const coldRooms = byCategory('cold_room');
  const generalAreas = byCategory('general');

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Image source={require('../../../assets/Kumva-New-Logo-D.png')} style={styles.logoImg} resizeMode="contain" />
        <Text style={styles.appTitle}>Kumva Insights</Text>
        {!isEmpty ? (
          <View style={styles.topBarIcons}>
            <TouchableOpacity style={styles.addIconBtn} onPress={() => navigation.navigate('AddDevice')}>
              <Text style={styles.addIconText}>＋</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>🔔</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

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
          {freezers.length > 0 && <CategorySection category="freezer" devices={freezers} navigation={navigation} />}
          {fridges.length > 0 && <CategorySection category="fridge" devices={fridges} navigation={navigation} />}
          {coldRooms.length > 0 && <CategorySection category="cold_room" devices={coldRooms} navigation={navigation} />}
          {generalAreas.length > 0 && <CategorySection category="general" devices={generalAreas} navigation={navigation} />}
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
  addIconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#5C6BC0', alignItems: 'center', justifyContent: 'center' },
  addIconText: { fontSize: 20, color: '#fff', lineHeight: 24 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F6FB', alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 18 },
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1C1C1E', letterSpacing: 0.5 },
  sectionRange: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF0FB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  activeText: { fontSize: 11, color: '#5C6BC0', fontWeight: '600' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  deviceCard: { flex: 1, minWidth: '45%', backgroundColor: '#F8F9FF', borderRadius: 12, padding: 12, gap: 4 },
  deviceCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  deviceName: { fontSize: 12, color: '#1C1C1E', fontWeight: '700', flex: 1 },
  deviceTemp: { fontSize: 22, fontWeight: '800', color: '#1C1C1E' },
  deviceMac: { fontSize: 10, color: '#9CA3AF' },
  graphContainer: { gap: 8 },
  graphTitle: { fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 0.4 },
  threshLine: { position: 'absolute', left: 0, right: 0, height: 1, borderTopWidth: 1.5, borderStyle: 'dashed' },
  xAxis: { flexDirection: 'row', marginTop: 4 },
  axisLabel: { fontSize: 9, color: '#9CA3AF' },
  noDataWrap: { height: GRAPH_H, alignItems: 'center', justifyContent: 'center' },
  noDataText: { fontSize: 12, color: '#9CA3AF' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendLine: { width: 16, height: 2, borderRadius: 1 },
  legendText: { fontSize: 10, color: '#9CA3AF' },
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
