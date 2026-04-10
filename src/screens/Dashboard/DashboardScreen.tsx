import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDevices } from '../../hooks/useDevices';
import { getReadingsByDevice } from '../../database/repositories/readingRepository';
import { Device, DeviceCategory } from '../../types/device';
import { Reading } from '../../types/reading';

const GRAPH_H = 130;

const CATEGORY_RANGES: Record<DeviceCategory, string> = {
  freezer:   'Range: -20 to 0°C',
  fridge:    'Range: 2 to 8°C',
  cold_room: 'Range: 0 to 10°C',
  general:   'Range: 15 to 30°C',
};

function getXLabels(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return `${d.toLocaleString('en', { month: 'short' })} ${d.getDate()}`;
  });
}

// ── Device graph ──────────────────────────────────────────────────────────────
function DeviceGraph({
  device, readings,
}: {
  device: Device;
  readings: Reading[];
}) {
  const [plotWidth, setPlotWidth] = useState(0);
  const now = Date.now();

  const dailyAvgs = Array.from({ length: 7 }, (_, i) => {
    const dayStart = now - (6 - i) * 86400000;
    const dayEnd   = dayStart + 86400000;
    const vals = readings
      .filter(r => r.timestamp >= dayStart && r.timestamp < dayEnd)
      .map(r => r.temperature);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  });

  const filled = [...dailyAvgs];
  for (let i = 0; i < filled.length; i++) {
    if (filled[i] === null) filled[i] = filled[i - 1] ?? filled[i + 1] ?? 0;
  }
  const data = filled as number[];

  const high = device.temp_high_threshold;
  const low  = device.temp_low_threshold;
  const allVals = [...data, high, low];
  const minV = Math.min(...allVals) - 3;
  const maxV = Math.max(...allVals) + 3;
  const range = maxV - minV || 1;
  const toY = (v: number) => GRAPH_H - ((v - minV) / range) * GRAPH_H;

  const step = (maxV - minV) / 4;
  const yLabels = Array.from({ length: 5 }, (_, i) => Math.round(maxV - i * step));
  const xLabels = getXLabels();
  const Y_W = 16;
  const hasData = readings.length > 0;

  return (
    <View style={gs.graphCard}>
      <Text style={gs.graphDeviceName}>{device.name}</Text>

      <View style={{ alignItems: 'center', width: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>
        {/* Y axis labels — outside the box */}
        <View style={{ width: Y_W, height: GRAPH_H, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 4 }}>
          {yLabels.map((l, i) => (
            <Text key={i} style={gs.axisLabel}>{l}°</Text>
          ))}
        </View>

        {/* Bordered plot box */}
        <View
          style={gs.plotBox}
          onLayout={e => setPlotWidth(e.nativeEvent.layout.width)}
        >
          {plotWidth > 0 && (
            <>
              {/* Grid lines */}
              {yLabels.map((_, i) => (
                <View key={i} style={[gs.gridLine, { top: (i / (yLabels.length - 1)) * GRAPH_H }]} />
              ))}

              {/* Threshold lines */}
              <View style={[gs.threshLine, { top: toY(high), borderColor: '#EF4444' }]} />
              <View style={[gs.threshLine, { top: toY(low),  borderColor: '#3B82F6' }]} />

              {/* Data line */}
              {hasData && data.length >= 2 && (() => {
                const ptStep = plotWidth / (data.length - 1);
                const pts = data.map((v, i) => ({ x: i * ptStep, y: toY(v) }));
                return pts.slice(0, -1).map((p, i) => {
                  const nx = pts[i + 1];
                  const dx = nx.x - p.x;
                  const dy = nx.y - p.y;
                  const len = Math.sqrt(dx * dx + dy * dy);
                  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                  return (
                    <View
                      key={i}
                      style={{
                        position: 'absolute', left: p.x, top: p.y,
                        width: len, height: 1.5,
                        backgroundColor: '#1C1C1E',
                        transformOrigin: '0 50%',
                        transform: [{ rotate: `${angle}deg` }],
                      }}
                    />
                  );
                });
              })()}

              {!hasData && (
                <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={gs.noDataText}>No readings yet</Text>
                </View>
              )}
            </>
          )}
        </View>
        </View>

        {/* X axis labels — aligned under the plot box */}
        <View style={{ flexDirection: 'row', width: '100%' }}>
          <View style={{ width: Y_W }} />
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 }}>
            {xLabels.map(l => <Text key={l} style={gs.axisLabel}>{l}</Text>)}
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={gs.legend}>
        <View style={gs.legendItem}>
          <View style={[gs.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={gs.legendText}>High Temperature Threshold</Text>
        </View>
        <View style={gs.legendItem}>
          <View style={[gs.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={gs.legendText}>Low Temperature Threshold</Text>
        </View>
        <View style={gs.legendItem}>
          <View style={[gs.legendLine, { backgroundColor: '#1C1C1E' }]} />
          <Text style={gs.legendText}>{device.name}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Device card ───────────────────────────────────────────────────────────────
function DeviceCard({
  device, lastTemp, isActive, onPress,
}: {
  device: Device;
  lastTemp: number | null;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, friction: 6 }).start()}
    >
      <Animated.View style={[dc.card, { transform: [{ scale }] }]}>
        <View style={dc.row}>
          <Text style={dc.name}>{device.name}</Text>
          <View style={[dc.dot, { backgroundColor: isActive ? '#22C55E' : '#D1D5DB' }]} />
        </View>
        <Text style={dc.temp}>
          {lastTemp !== null
            ? <Text>{'℉ '}<Text style={dc.tempBig}>{Math.abs(lastTemp).toFixed(1)}</Text>{'°C'}</Text>
            : '-- °C'}
        </Text>
        <Text style={dc.battery}>
          🔋 {device.battery_level != null ? `${device.battery_level}%` : '--'}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// ── Category section ──────────────────────────────────────────────────────────
function CategorySection({
  category, devices, navigation, sectionIndex,
}: {
  category: DeviceCategory;
  devices: Device[];
  navigation: any;
  sectionIndex: number;
}) {
  const [readingsMap, setReadingsMap] = useState<Record<string, Reading[]>>({});
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, delay: sectionIndex * 120, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, delay: sectionIndex * 120, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    devices.forEach(d => {
      getReadingsByDevice(d.device_id, 100)
        .then(r => setReadingsMap(prev => ({ ...prev, [d.device_id]: r })))
        .catch(console.error);
    });
  }, [devices]);

  const label = category === 'cold_room' ? 'COLD ROOM'
    : category === 'general' ? 'GENERAL AREA'
    : category.toUpperCase();

  const ACTIVE_WINDOW_MS = 5 * 60 * 1000;
  const activeCount = devices.filter(d => {
    const r = readingsMap[d.device_id];
    return r && r.length > 0 && Date.now() - r[0].timestamp < ACTIVE_WINDOW_MS;
  }).length;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {/* ── Category header ── */}
      <View style={cs.catHeader}>
        <View>
          <Text style={cs.catLabel}>{label}</Text>
          <Text style={cs.catRange}>{CATEGORY_RANGES[category]}</Text>
        </View>
        {activeCount > 0 && (
          <View style={cs.activeBadge}>
            <View style={cs.activeDot} />
            <Text style={cs.activeText}>{activeCount} Active</Text>
          </View>
        )}
      </View>

      {/* ── Per-device: card then graph ── */}
      {devices.map(d => {
        const readings = readingsMap[d.device_id] ?? [];
        const lastTemp = readings.length > 0 ? readings[0].temperature : null;
        const isActive = readings.length > 0 && Date.now() - readings[0].timestamp < ACTIVE_WINDOW_MS;
        return (
          <View key={d.device_id}>
            <DeviceCard
              device={d}
              lastTemp={lastTemp}
              isActive={isActive}
              onPress={() => navigation.navigate('DeviceDetail', { deviceId: d.device_id })}
            />
            <DeviceGraph device={d} readings={readings} />
          </View>
        );
      })}
    </Animated.View>
  );
}

// ── Bell shake ────────────────────────────────────────────────────────────────
function useBellShake() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const shake = Animated.sequence([
      Animated.timing(anim, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 4,  duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -4, duration: 60, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]);
    Animated.loop(Animated.sequence([shake, Animated.delay(5000)]), { iterations: -1 }).start();
  }, []);
  return anim;
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }: any) {
  const { devices } = useDevices();
  const isEmpty = devices.length === 0;
  const bellShake   = useBellShake();
  const addBtnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isEmpty) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(addBtnScale, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(addBtnScale, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isEmpty]);

  const byCategory = (cat: DeviceCategory) => devices.filter(d => d.category === cat);
  const freezers     = byCategory('freezer');
  const fridges      = byCategory('fridge');
  const coldRooms    = byCategory('cold_room');
  const generalAreas = byCategory('general');

  return (
    <SafeAreaView style={ms.container}>
      {/* Top bar */}
      <View style={ms.topBar}>
        <Image source={require('../../../assets/Kumva-New-Logo-D.png')} style={ms.logo} resizeMode="contain" />
        <Text style={ms.appTitle}>Kumva Insights</Text>
        <View style={ms.topRight}>
          {!isEmpty && (
            <Pressable
              style={ms.addBtn}
              onPress={() => navigation.navigate('AddDevice')}
              onPressIn={() => Animated.spring(addBtnScale, { toValue: 0.9, useNativeDriver: true, friction: 8 }).start()}
              onPressOut={() => Animated.spring(addBtnScale, { toValue: 1,  useNativeDriver: true, friction: 6 }).start()}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </Pressable>
          )}
          <TouchableOpacity
            style={ms.bellBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ translateX: bellShake }] }}>
              <Ionicons name="notifications-outline" size={20} color="#1C1C1E" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {isEmpty ? (
        <View style={ms.emptyWrap}>
          <View style={ms.iconCircle}>
            <View style={ms.noSignal}>
              <View style={ms.diagLine} />
              <View style={[ms.arc, { width: 52, height: 52, borderRadius: 26, top: 14, left: 14 }]} />
              <View style={[ms.arc, { width: 34, height: 34, borderRadius: 17, top: 23, left: 23 }]} />
              <View style={[ms.arc, { width: 16, height: 16, borderRadius: 8,  top: 32, left: 32 }]} />
            </View>
          </View>
          <Text style={ms.emptyTitle}>No devices added yet</Text>
          <Text style={ms.emptySubtitle}>
            Start monitoring your storage environment{'\n'}
            by connecting your first BLE sensor.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('AddDevice')}
            onPressIn={() => Animated.spring(addBtnScale, { toValue: 0.96, useNativeDriver: true, friction: 8 }).start()}
            onPressOut={() => Animated.spring(addBtnScale, { toValue: 1,    useNativeDriver: true, friction: 6 }).start()}
          >
            <Animated.View style={[ms.addDeviceBtn, { transform: [{ scale: addBtnScale }] }]}>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={ms.addDeviceBtnText}>Add Device</Text>
            </Animated.View>
          </Pressable>
          <Text style={ms.footer}>CONNECTED INFRASTRUCTURE STARTS HERE</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={ms.scroll} showsVerticalScrollIndicator={false}>
          {freezers.length     > 0 && <CategorySection category="freezer"   devices={freezers}     navigation={navigation} sectionIndex={0} />}
          {fridges.length      > 0 && <CategorySection category="fridge"    devices={fridges}      navigation={navigation} sectionIndex={1} />}
          {coldRooms.length    > 0 && <CategorySection category="cold_room" devices={coldRooms}    navigation={navigation} sectionIndex={2} />}
          {generalAreas.length > 0 && <CategorySection category="general"   devices={generalAreas} navigation={navigation} sectionIndex={3} />}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

// Main screen
const ms = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#F4F6FB' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB',
  },
  logo:       { width: 48, height: 32 },
  appTitle:   { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
  topRight:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn:     { width: 32, height: 32, borderRadius: 8, backgroundColor: '#5C6BC0', alignItems: 'center', justifyContent: 'center' },
  bellBtn:    { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F4F6FB', alignItems: 'center', justifyContent: 'center' },
  scroll:     { paddingBottom: 48 },
  emptyWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  iconCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#E8EAF6', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  noSignal:   { width: 80, height: 80, position: 'relative' },
  diagLine:   { position: 'absolute', width: 2, height: 90, backgroundColor: '#5C6BC0', top: -5, left: 39, transform: [{ rotate: '-45deg' }], zIndex: 2 },
  arc:        { position: 'absolute', borderWidth: 3, borderColor: '#5C6BC0', borderBottomColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  addDeviceBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#5C6BC0', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32,
    width: '100%', marginTop: 8,
    shadowColor: '#5C6BC0', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  addDeviceBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  footer:     { fontSize: 10, color: '#9CA3AF', letterSpacing: 1.2, fontWeight: '600', marginTop: 8 },
});

// Category section
const cs = StyleSheet.create({
  catHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12,
  },
  catLabel:   { fontSize: 13, fontWeight: '800', color: '#1C1C1E', letterSpacing: 0.6 },
  catRange:   { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  activeBadge:{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF0FB', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  activeDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  activeText: { fontSize: 11, color: '#5C6BC0', fontWeight: '600' },
});

// Device card
const dc = StyleSheet.create({
  card: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    alignSelf: 'center', width: '92%',
  },
  row:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name:     { fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  dot:      { width: 9, height: 9, borderRadius: 5 },
  temp:     { fontSize: 14, color: '#1C1C1E', marginBottom: 4 },
  tempBig:  { fontSize: 32, fontWeight: '800', color: '#1C1C1E' },
  battery:  { fontSize: 12, color: '#9CA3AF' },
});

// Graph
const gs = StyleSheet.create({
  graphCard: {
    marginHorizontal: 16, marginBottom: 24,
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    alignSelf: 'center', width: '92%',
  },
  graphDeviceName: { fontSize: 13, fontWeight: '700', color: '#1C1C1E', marginBottom: 10 },
  // Bordered plot box — fills remaining width, fixed height
  plotBox: {
    flex: 1,
    height: GRAPH_H,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  gridLine:   { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB' },
  threshLine: { position: 'absolute', left: 0, right: 0, height: 1, borderTopWidth: 1, borderStyle: 'dashed' },
  axisLabel:  { fontSize: 8, color: '#9CA3AF' },
  noDataText: { fontSize: 12, color: '#C4C4C4' },
  legend:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:  { width: 6, height: 6, borderRadius: 3 },
  legendLine: { width: 14, height: 2, borderRadius: 1 },
  legendText: { fontSize: 9, color: '#6B7280' },
});
