import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onEnable: () => void;
  onCancel: () => void;
}

export default function BluetoothPermissionModal({ visible, onEnable, onCancel }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="bluetooth" size={32} color="#5C6BC0" />
            <View style={styles.waveDot} />
          </View>
          <Text style={styles.title}>Enable Bluetooth</Text>
          <Text style={styles.body}>
            Bluetooth permission is required. Please enable it to continue.
          </Text>
          <TouchableOpacity style={styles.enableBtn} onPress={onEnable} activeOpacity={0.85}>
            <Text style={styles.enableText}>Enable Bluetooth</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF0FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    flexDirection: 'row',
  },
  waveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#5C6BC0',
    marginLeft: -4,
    marginTop: -12,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1C1C1E', textAlign: 'center' },
  body: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 21 },
  enableBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#5C6BC0',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#5C6BC0',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  enableText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F4F6FB',
    alignItems: 'center',
  },
  cancelText: { color: '#6B7280', fontSize: 15, fontWeight: '600' },
});
