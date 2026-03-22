import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { initDb } from './src/database/db';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import BluetoothPermissionModal from './src/components/common/BluetoothPermissionModal';
import { requestBluetoothPermissions } from './src/utils/permissions';
import { useSync } from './src/hooks/useSync';

function AppContent() {
  useSync();
  return <AppNavigator />;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showBtModal, setShowBtModal] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    initDb().catch(console.error);
  }, []);

  const checkPermissions = async () => {
    const granted = await requestBluetoothPermissions();
    if (granted) {
      setPermissionsGranted(true);
      setShowBtModal(false);
    } else {
      setShowBtModal(true);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    checkPermissions();
  };

  const handleEnable = async () => {
    // Try requesting again; if denied permanently, open app settings
    const granted = await requestBluetoothPermissions();
    if (granted) {
      setPermissionsGranted(true);
      setShowBtModal(false);
    } else {
      Linking.openSettings();
    }
  };

  const handleCancel = () => {
    // Allow continuing without BLE — app will work in limited mode
    setShowBtModal(false);
    setPermissionsGranted(true);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <>
      <AppContent />
      <BluetoothPermissionModal
        visible={showBtModal}
        onEnable={handleEnable}
        onCancel={handleCancel}
      />
    </>
  );
}
