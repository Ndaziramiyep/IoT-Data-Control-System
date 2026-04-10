import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NativeSplash from 'expo-splash-screen';
import { initDb } from './src/database/db';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import BluetoothPermissionModal from './src/components/common/BluetoothPermissionModal';
import {
  PermissionStatus,
  checkAllStatus,
  requestPermissions,
  openLocationSettings,
  openAppSettings,
} from './src/utils/permissions';
import { useSync } from './src/hooks/useSync';

// Keep native splash visible until JS is ready
NativeSplash.preventAutoHideAsync().catch(() => {});

function AppContent() {
  useSync();
  return <AppNavigator />;
}

export default function App() {
  const [showSplash, setShowSplash]   = useState(true);
  const [status, setStatus]           = useState<PermissionStatus>('needs_permission');

  useEffect(() => {
    initDb().catch(console.error);
    // Hide native splash immediately — our JS SplashScreen takes over
    NativeSplash.hideAsync().catch(() => {});
  }, []);

  // Re-check every time the app comes back to foreground (user returns from Settings)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && !showSplash) runCheck();
    });
    return () => sub.remove();
  }, [showSplash]);

  const runCheck = useCallback(async () => {
    const s = await checkAllStatus();
    setStatus(s);
  }, []);

  const handleSplashFinish = async () => {
    setShowSplash(false);
    await runCheck();
  };

  const handlePrimaryAction = async () => {
    if (status === 'needs_permission') {
      const result = await requestPermissions();
      if (result === 'granted') {
        await runCheck();
      } else {
        setStatus('denied');
      }
    } else if (status === 'denied') {
      await openAppSettings();
    } else if (status === 'location_off') {
      await openLocationSettings();
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {status === 'granted' ? (
        <AppContent />
      ) : (
        <BluetoothPermissionModal
          status={status}
          onPrimaryAction={handlePrimaryAction}
        />
      )}
    </SafeAreaProvider>
  );
}
