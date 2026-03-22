import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { insertDevice, getAllDevices } from '../../database/repositories/deviceRepository';
import { useAppStore } from '../../store/store';
import { Device, DeviceCategory } from '../../types/device';

const CATEGORIES: { label: string; value: DeviceCategory }[] = [
  { label: 'Freezer', value: 'freezer' },
  { label: 'Fridge', value: 'fridge' },
  { label: 'Cold Room', value: 'cold_room' },
];

export default function DeviceConfigScreen({ navigation, route }: any) {
  const addDevice = useAppStore(s => s.addDevice);
  const existingDevices = useAppStore(s => s.devices);
  const scanned = route.params?.scannedDevice as { name: string; macAddress: string; category?: string } | null;

  const [name, setName] = useState(scanned?.name ?? '');
  const [macAddress, setMacAddress] = useState(scanned?.macAddress ?? '');
  const [category, setCategory] = useState<DeviceCategory>(
    (scanned?.category as DeviceCategory) ?? 'freezer'
  );
  const [highThreshold, setHighThreshold] = useState('0');
  const [lowThreshold, setLowThreshold] = useState('-20');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Device Name Required', 'Please enter a name for this device.');
      return;
    }
    const trimmedMac = macAddress.trim().toUpperCase();
    if (!trimmedMac) {
      Alert.alert('MAC Address Required', 'Please enter the device MAC address.');
      return;
    }
    // Check duplicate MAC in Zustand store (covers web + native in-session)
    const duplicateInStore = existingDevices.find(
      d => d.macAddress.toUpperCase() === trimmedMac
    );
    if (duplicateInStore) {
      Alert.alert(
        'Device Already Registered',
        `A device with MAC address ${trimmedMac} is already registered as "${duplicateInStore.name}".`
      );
      return;
    }
    setSaving(true);
    try {
      // Also check DB for duplicates (native only — catches devices from previous sessions)
      const dbDevices = await getAllDevices();
      const duplicateInDb = dbDevices.find(
        d => d.macAddress.toUpperCase() === trimmedMac
      );
      if (duplicateInDb) {
        Alert.alert(
          'Device Already Registered',
          `A device with MAC address ${trimmedMac} is already registered as "${duplicateInDb.name}".`
        );
        setSaving(false);
        return;
      }
      const device: Device = {
        id: Date.now().toString(),
        name: trimmedName,
        category,
        macAddress: trimmedMac,
        minTemp: Number(lowThreshold),
        maxTemp: Number(highThreshold),
        createdAt: Date.now(),
      };
      // Persist to SQLite on native (no-op on web)
      await insertDevice(device).catch(console.error);
      // Add to Zustand store — this triggers Dashboard re-render
      addDevice(device);
      // Small delay ensures Zustand state is committed before navigation reset
      await new Promise(r => setTimeout(r, 50));
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      Alert.alert('Error', 'Failed to save device. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedLabel = CATEGORIES.find(c => c.value === category)?.label ?? 'Freezer';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configure Device</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* New Device Found banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Text style={styles.bannerIconText}>·))</Text>
          </View>
          <Text style={styles.bannerText}>New Device Found</Text>
        </View>

        {/* Device Name */}
        <Text style={styles.label}>DEVICE NAME</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Main Freezer 01"
          placeholderTextColor="#B0B8C8"
          value={name}
          onChangeText={setName}
        />

        {/* MAC Address */}
        <Text style={styles.label}>MAC ADDRESS</Text>
        <TextInput
          style={[styles.input, !!scanned?.macAddress && styles.inputReadonly]}
          placeholder="e.g. AA:BB:CC:DD:EE:FF"
          placeholderTextColor="#B0B8C8"
          value={macAddress}
          onChangeText={setMacAddress}
          autoCapitalize="characters"
          editable={!scanned?.macAddress}
        />

        {/* Category */}
        <Text style={styles.label}>CATEGORY</Text>
        <TouchableOpacity
          style={styles.select}
          onPress={() => setShowCategoryPicker(v => !v)}
          activeOpacity={0.8}
        >
          <Text style={styles.selectText}>{selectedLabel}</Text>
          <Text style={styles.chevron}>{showCategoryPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {showCategoryPicker && (
          <View style={styles.dropdown}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.value}
                style={[styles.dropdownItem, c.value === category && styles.dropdownItemActive]}
                onPress={() => { setCategory(c.value); setShowCategoryPicker(false); }}
              >
                <Text style={[styles.dropdownText, c.value === category && styles.dropdownTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Thresholds */}
        <View style={styles.thresholdRow}>
          <View style={styles.thresholdCol}>
            <Text style={styles.label}>HIGH THRESHOLD</Text>
            <View style={styles.thresholdInput}>
              <TextInput
                style={styles.thresholdValue}
                value={highThreshold}
                onChangeText={setHighThreshold}
                keyboardType="numeric"
              />
              <Text style={styles.unit}>°C</Text>
            </View>
          </View>
          <View style={styles.thresholdCol}>
            <Text style={styles.label}>LOW THRESHOLD</Text>
            <View style={styles.thresholdInput}>
              <TextInput
                style={styles.thresholdValue}
                value={lowThreshold}
                onChangeText={setLowThreshold}
                keyboardType="numeric"
              />
              <Text style={styles.unit}>°C</Text>
            </View>
          </View>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ⓘ</Text>
          <Text style={styles.infoText}>
            Setting a proper threshold ensures you receive critical alerts before product spoilage occurs.
            Notifications will be sent to the assigned supervisor.
          </Text>
        </View>

        <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} activeOpacity={0.85} disabled={saving}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <><Text style={styles.saveBtnIcon}>💾</Text><Text style={styles.saveBtnText}>Save Device</Text></>}
        </TouchableOpacity>

        {/* Cancel */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6FB' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F4F6FB',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  backIcon: { fontSize: 18, color: '#1C1C1E' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },

  body: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  bannerIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EEF0FB', alignItems: 'center', justifyContent: 'center',
  },
  bannerIconText: { fontSize: 16, color: '#5C6BC0', fontWeight: '700' },
  bannerText: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },

  label: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.8, marginBottom: -4 },

  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1C1C1E',
  },
  inputReadonly: {
    backgroundColor: '#F4F6FB',
    color: '#9CA3AF',
  },

  select: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: { fontSize: 15, color: '#1C1C1E' },
  chevron: { fontSize: 12, color: '#9CA3AF' },

  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginTop: -8,
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12 },
  dropdownItemActive: { backgroundColor: '#EEF0FB' },
  dropdownText: { fontSize: 15, color: '#1C1C1E' },
  dropdownTextActive: { color: '#5C6BC0', fontWeight: '600' },

  thresholdRow: { flexDirection: 'row', gap: 12 },
  thresholdCol: { flex: 1, gap: 6 },
  thresholdInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  thresholdValue: { flex: 1, fontSize: 15, color: '#1C1C1E' },
  unit: { fontSize: 14, color: '#9CA3AF' },

  infoBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#EEF0FB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
  },
  infoIcon: { fontSize: 16, color: '#5C6BC0', marginTop: 1 },
  infoText: { flex: 1, fontSize: 13, color: '#4B5563', lineHeight: 20 },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#5C6BC0',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#5C6BC0',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  saveBtnIcon: { fontSize: 18 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  saveBtnDisabled: { opacity: 0.7 },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: '#9CA3AF', fontSize: 15 },
});
