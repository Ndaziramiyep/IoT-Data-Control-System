import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import AddDeviceScreen from '../screens/AddDevice/AddDeviceScreen';
import ScannerScreen from '../screens/AddDevice/ScannerScreen';
import DeviceConfigScreen from '../screens/AddDevice/DeviceConfigScreen';
import DeviceDetailScreen from '../screens/DeviceDetail/DeviceDetailScreen';
import IncidentsScreen from '../screens/Incidents/IncidentsScreen';
import ReportsScreen from '../screens/Reports/ReportsScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Incidents" component={IncidentsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={Tabs} />
        <Stack.Screen name="AddDevice" component={AddDeviceScreen} />
        <Stack.Screen name="Scanner" component={ScannerScreen} />
        <Stack.Screen name="DeviceConfig" component={DeviceConfigScreen} />
        <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
