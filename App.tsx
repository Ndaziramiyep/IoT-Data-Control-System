import React, { useEffect, useState } from 'react';
import { initDb } from './src/database/db';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { useSync } from './src/hooks/useSync';

function AppContent() {
  useSync();
  return <AppNavigator />;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initDb().catch(console.error);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return <AppContent />;
}
