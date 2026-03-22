import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';

interface BleAdvertisement {
  name: string;
  macAddress: string;
  category?: string;
}

export default function ScannerScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const scanLock = useRef(false);

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanLock.current) return;
    scanLock.current = true;
    setScanned(true);

    try {
      const parsed: BleAdvertisement = JSON.parse(data);
      if (!parsed.macAddress || !parsed.name) throw new Error('Invalid');
      navigation.navigate('DeviceConfig', { scannedDevice: parsed });
    } catch {
      Alert.alert(
        'Invalid QR Code',
        'Expected format:\n{"name":"Sensor-01","macAddress":"AA:BB:CC:DD:EE:FF","category":"freezer"}',
        [{
          text: 'Try Again',
          onPress: () => { setScanned(false); scanLock.current = false; },
        }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Onboard Device</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Camera viewfinder box */}
        <View style={styles.viewfinderWrap}>
          {hasPermission === true ? (
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
          ) : (
            <View style={styles.cameraPlaceholder}>
              {/* QR placeholder icon */}
              <View style={styles.qrIcon}>
                <View style={styles.qrRow}>
                  <View style={styles.qrCell} /><View style={styles.qrCellEmpty} /><View style={styles.qrCell} />
                </View>
                <View style={styles.qrRow}>
                  <View style={styles.qrCellEmpty} /><View style={styles.qrCell} /><View style={styles.qrCellEmpty} />
                </View>
                <View style={styles.qrRow}>
                  <View style={styles.qrCell} /><View style={styles.qrCellEmpty} /><View style={styles.qrCell} />
                </View>
              </View>
            </View>
          )}

          {/* Corner brackets */}
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>

        {/* Text */}
        <Text style={styles.title}>Scan device QR code</Text>
        <Text style={styles.subtitle}>
          Align the QR code within the frame to start{'\n'}pairing with your network.
        </Text>

        {hasPermission === false && (
          <Text style={styles.permissionNote}>Camera permission denied. Enable it in Settings.</Text>
        )}

        {/* Register manually button */}
        <TouchableOpacity
          style={styles.manualBtn}
          onPress={() => navigation.navigate('DeviceConfig', { scannedDevice: null })}
          activeOpacity={0.85}
        >
          <Text style={styles.manualBtnText}>Register Device manually</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CORNER_SIZE = 28;
const CORNER_BORDER = 3;
const CORNER_COLOR = '#5C6BC0';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2FA' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F0F2FA',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backIcon: { fontSize: 24, color: '#1C1C1E', lineHeight: 28 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },

  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 32,
    gap: 20,
  },

  viewfinderWrap: {
    width: 240,
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E2E5F0',
    position: 'relative',
  },
  camera: { width: '100%', height: '100%' },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E5F0',
  },

  // Simple QR placeholder icon
  qrIcon: { gap: 4 },
  qrRow: { flexDirection: 'row', gap: 4 },
  qrCell: { width: 18, height: 18, backgroundColor: '#B0B8D0', borderRadius: 2 },
  qrCellEmpty: { width: 18, height: 18 },

  // Corner brackets overlaid on top of camera
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: CORNER_COLOR,
  },
  tl: { top: 0, left: 0, borderTopWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER, borderTopLeftRadius: 4 },
  tr: { top: 0, right: 0, borderTopWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER, borderTopRightRadius: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: CORNER_BORDER, borderLeftWidth: CORNER_BORDER, borderBottomLeftRadius: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: CORNER_BORDER, borderRightWidth: CORNER_BORDER, borderBottomRightRadius: 4 },

  title: { fontSize: 20, fontWeight: '800', color: '#1C1C1E', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  permissionNote: { fontSize: 12, color: '#EF4444', textAlign: 'center' },

  manualBtn: {
    backgroundColor: '#5C6BC0',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#5C6BC0',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  manualBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
