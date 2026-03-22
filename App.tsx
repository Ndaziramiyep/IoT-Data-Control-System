import React, { useEffect } from 'react';
import { initDb } from './src/database/db';
import AppNavigator from './src/navigation/AppNavigator';
import { useSync } from './src/hooks/useSync';

function AppContent() {
  useSync();
  return <AppNavigator />;
}

export default function App() {
  useEffect(() => {
    initDb().catch(console.error);
  }, []);

  return <AppContent />;
}
