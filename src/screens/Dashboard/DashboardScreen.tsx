import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import KumvaLogo from '../../components/common/KumvaLogo';
import { useDevices } from '../../hooks/useDevices';

export default function DashboardScreen({ navigation }: any) {
  const { devices } = useDevices();

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <KumvaLogo size="small" />
        <Text style={styles.appTitle}>Kumva Insights</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Empty state */}
      {devices.length === 0 && (
        <View style={styles.emptyWrap}>
          {/* No-signal icon circle */}
          <View style={styles.iconCircle}>
            <View style={styles.noSignal}>
              {/* diagonal line */}
              <View style={styles.diagLine} />
              {/* arcs */}
              <View style={[styles.signalArc, { width: 52, height: 52, borderRadius: 26, top: 14, left: 14 }]} />
              <View style={[styles.signalArc, { width: 34, height: 34, borderRadius: 17, top: 23, left: 23 }]} />
              <View style={[styles.signalArc, { width: 16, height: 16, borderRadius: 8, top: 32, left: 32 }]} />
            </View>
          </View>

          <Text style={styles.emptyTitle}>No devices added yet</Text>
          <Text style={styles.emptySubtitle}>
            Start monitoring your storage environment{'\n'}
            by connecting your first BLE sensor. Track{'\n'}
            incidents and  view real-time data.
          </Text>

          {/* Add Device button */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddDevice')}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnIcon}>⊕</Text>
            <Text style={styles.addBtnText}>Add Device</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>CONNECTED INFRASTRUCTURE STARTS HERE</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  appTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },

  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#EAEDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  noSignal: { width: 80, height: 80, position: 'relative' },
  diagLine: {
    position: 'absolute',
    width: 2,
    height: 90,
    backgroundColor: '#5C6BC0',
    top: -5,
    left: 39,
    transform: [{ rotate: '-45deg' }],
    zIndex: 2,
  },
  signalArc: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#5C6BC0',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#5C6BC0',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    marginTop: 8,
    shadowColor: '#5C6BC0',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  addBtnIcon: { color: '#fff', fontSize: 20 },
  addBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  footer: {
    fontSize: 10,
    color: '#9CA3AF',
    letterSpacing: 1.2,
    fontWeight: '600',
    marginTop: 8,
  },
});
