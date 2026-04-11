# IoT Data Control System (Kumva Insights)

This document is a full technical handoff for this project. It explains architecture, runtime flow, screen behavior, storage model, service logic, and known gaps so a new developer can quickly understand the system.

## Project Summary

Kumva Insights is an Expo + React Native application for monitoring IoT temperature devices in cold-chain and storage environments.

Implemented user-facing capabilities:

- Device onboarding via QR scanner or manual registration.
- Category-based threshold setup per device.
- Dashboard with category sections and 7-day temperature overview graph.
- Device detail screen with per-device graphs and sync action.
- Incident listing with search and export placeholders.
- Report generation preview with category/time filters.
- Local persistence with SQLite on native.

Current technical limitations:

- Real BLE scan/read pipeline is placeholder.
- Notifications and file exports are placeholder.
- Threshold incident service does not match current type schema and is not wired.

## Tech Stack

- React Native 0.83.4.
- Expo SDK 55.
- TypeScript.
- Zustand for state management.
- React Navigation (Native Stack + Bottom Tabs).
- expo-sqlite for local DB.
- expo-camera for QR scanning.
- expo-location and PermissionsAndroid for permission flow.

## Runtime Scripts

- start: expo start
- android: expo run:android
- ios: expo run:ios
- web: expo start --web

## Architecture Overview

Layers in runtime order:

- UI layer: screens and reusable components.
- Navigation layer: stack and tabs.
- State layer: Zustand slices.
- Data access layer: SQLite repositories.
- Service layer: sync, cache, BLE, threshold, export, notification.
- Utility/type layer: permissions, constants, formatters, interfaces.

## Directory Responsibilities

- App.tsx
  - Application bootstrap and permission gate.
  - Splash handling.
  - Database initialization.

- src/navigation/AppNavigator.tsx
  - Stack routes: Main, AddDevice, Scanner, DeviceConfig, DeviceDetail, Notifications.
  - Tab routes: Dashboard, Reports, Incidents.
  - Tab bar hidden when no devices exist.

- src/screens
  - SplashScreen.tsx: startup animation.
  - AddDevice/ScannerScreen.tsx: camera scanner and manual fallback.
  - AddDevice/DeviceConfigScreen.tsx: add or reconfigure device.
  - Dashboard/DashboardScreen.tsx: overview graph and category sections.
  - DeviceDetail/DeviceDetailScreen.tsx: detailed metrics and graphs.
  - Incidents/IncidentsScreen.tsx: incident list/search.
  - Reports/ReportsScreen.tsx: report generation and preview.
  - Notifications/NotificationsScreen.tsx: mock notifications feed.

- src/database
  - db.ts: DB open/init and web fallback for devices.
  - schema.ts: CREATE TABLE definitions.
  - repositories/*.ts: query APIs per entity.

- src/store
  - store.ts: combined Zustand store.
  - slices/deviceSlice.ts.
  - slices/incidentSlice.ts.
  - slices/syncSlice.ts.

- src/hooks
  - useDevices.ts.
  - useIncidents.ts.
  - useLiveReadings.ts.
  - useSync.ts.

- src/services
  - cacheService.ts.
  - syncService.ts.
  - bluetoothService.ts (placeholder).
  - thresholdService.ts (schema mismatch).
  - exportService.ts (placeholder).
  - notificationService.ts (placeholder).

- src/utils
  - permissions.ts.
  - constants.ts.
  - formatters.ts.

- src/types
  - device.ts, reading.ts, incident.ts, report.ts, reminder.ts.

## App Startup and Runtime Flow

Startup sequence in App.tsx:

1. App mounts.
2. initDb() initializes tables.
3. Native splash is hidden and custom splash screen is shown.
4. After splash completion, checkAllStatus() runs.
5. If permission status is granted, AppNavigator is rendered.
6. Otherwise BluetoothPermissionModal is rendered.
7. AppState listener re-checks permissions when returning to foreground.

Permission action behavior:

- needs_permission: requestPermissions().
- denied: openAppSettings().
- location_off: openLocationSettings().

## Navigation Model

Stack screens:

- Main.
- AddDevice.
- Scanner.
- DeviceConfig.
- DeviceDetail.
- Notifications.

Bottom tabs inside Main:

- Dashboard.
- Reports.
- Incidents.

Tab visibility rule:

- Tabs are hidden until at least one device exists in store.

## Screen Logic Details

### SplashScreen

- Animated branding splash.
- Calls onFinish when animation is done.

### DashboardScreen

- Uses useDevices() for one-time DB hydration.
- Fetches recent readings per device from reading repository.
- Builds 7-day daily average graph lines per device.
- Fills missing daily points with neighbor values for continuity.
- Computes global graph min/max from reading data and thresholds.
- Draws threshold guide lines and per-device legend.
- Shows device cards with latest temperature, humidity, battery, active status.
- Navigates to DeviceDetail on card tap.

### ScannerScreen

- Requests camera permissions using expo-camera.
- Parses scanned QR data as JSON.
- Expected payload fields: name, macAddress, optional category.
- Valid payload routes to DeviceConfig.
- Invalid payload opens retry alert.
- Has manual registration button.

### DeviceConfigScreen

- Supports create and reconfigure modes.
- Uses category defaults:
  - freezer: low -20, high 0
  - fridge: low 2, high 8
  - cold_room: low 0, high 10
  - general: low 15, high 30
- Enforces threshold values within plus/minus 5 of category defaults.
- Prevents duplicate MAC addresses:
  - in current store
  - in persisted DB
- New save flow:
  - creates device with device_id = Date.now().toString()
  - insertDevice()
  - addDevice()
  - navigation reset to Main
- Reconfigure flow:
  - updateDevice() in repository
  - updateDevice() in store slice

### DeviceDetailScreen

- Resolves selected device from store using route param deviceId.
- Loads readings and incident count on mount.
- Computes 7-day average series for temperature and humidity.
- Displays stat cards for current temp, humidity, battery, last sync, incident count.
- Sync Data button:
  - updateDeviceSync(device_id, Date.now(), battery_level)
  - re-fetches readings
  - shows success/failure alert
- Reconfigure button routes to DeviceConfig with existing values.

### IncidentsScreen

- Loads incidents from DB via getAllIncidents().
- Enriches incident rows with device name/category from store.
- Search filters by device name and category.
- If filtered result is empty, screen displays SAMPLE_INCIDENTS fallback.
- Export buttons show placeholder alerts.

### ReportsScreen

- Supports category filter: all, freezer, fridge, cold_room, general.
- Supports time filters: Week, Month, Custom date range.
- Generates report preview by:
  - selecting devices by category
  - loading readings with getReadingsByDevice(device_id, 1000)
  - filtering by selected date range
  - storing preview rows in state
- Persists report metadata with insertReport() and file_url as null.
- Export actions currently show placeholder alerts only.

### NotificationsScreen

- Uses mock notifications data only.
- Includes tab filter (All or Unread).
- Includes animated list entry and delete animation.
- Not connected yet to reminder repository or notification service.

## Data Model and Database Schema

Tables created in src/database/schema.ts:

devices:

- device_id TEXT PRIMARY KEY.
- name TEXT NOT NULL.
- category TEXT NOT NULL.
- mac_address TEXT NOT NULL UNIQUE.
- temp_low_threshold REAL NOT NULL DEFAULT -20.
- temp_high_threshold REAL NOT NULL DEFAULT 0.
- battery_level INTEGER nullable.
- last_sync INTEGER nullable.
- created_at INTEGER NOT NULL.

readings:

- reading_id INTEGER PRIMARY KEY AUTOINCREMENT.
- device_id TEXT NOT NULL FK to devices(device_id) with ON DELETE CASCADE.
- temperature REAL NOT NULL.
- humidity REAL nullable.
- timestamp INTEGER NOT NULL.

incidents:

- incident_id INTEGER PRIMARY KEY AUTOINCREMENT.
- device_id TEXT NOT NULL FK to devices(device_id) with ON DELETE CASCADE.
- start_time INTEGER NOT NULL.
- end_time INTEGER nullable.
- max_temperature REAL NOT NULL.

reports:

- report_id INTEGER PRIMARY KEY AUTOINCREMENT.
- filter_categories TEXT nullable.
- time_range_start INTEGER nullable.
- time_range_end INTEGER nullable.
- file_url TEXT nullable.
- generated INTEGER NOT NULL.

reminders:

- reminder_id INTEGER PRIMARY KEY AUTOINCREMENT.
- frequency TEXT NOT NULL.
- last_sent INTEGER nullable.
- is_active INTEGER NOT NULL DEFAULT 1.

DB behavior notes:

- Foreign keys are enabled in db.ts via PRAGMA foreign_keys = ON.
- On web, getReadyDb() returns null and only device list is persisted through localStorage.

## Repository API Contract

deviceRepository.ts:

- getAllDevices().
- insertDevice(device).
- deleteDevice(device_id).
- updateDevice(device).
- updateDeviceSync(device_id, last_sync, battery_level?).

readingRepository.ts:

- getReadingsByDevice(device_id, limit).
- insertReading(reading).
- insertReadings(readings).

incidentRepository.ts:

- getAllIncidents().
- getIncidentsByDevice(device_id).
- insertIncident(incident).
- closeIncident(incident_id, end_time).

reportRepository.ts:

- getAllReports().
- insertReport(report).

reminderRepository.ts:

- getAllReminders().
- insertReminder(reminder).
- setReminderActive(reminder_id, is_active).

## Zustand Store Contract

Combined store in src/store/store.ts includes three slices.

Device slice:

- devices: Device[].
- setDevices(devices).
- addDevice(device).
- removeDevice(device_id).
- updateDevice(device).

Incident slice:

- incidents: Incident[].
- setIncidents(incidents).
- addIncident(incident).

Sync slice:

- lastSyncedAt: number | null.
- setLastSyncedAt(ts).

Hydration behavior:

- useDevices.ts contains module-level hydrated flag to ensure DB hydration runs once per app session.

## Hooks Behavior

useDevices.ts:

- Loads devices from DB once.
- Merges DB records with any devices already in store.

useIncidents.ts:

- Loads incidents from repository and updates incident slice.

useLiveReadings.ts:

- Polls readings every 5 seconds for a device.

useSync.ts:

- Starts sync loop on mount.
- Stops sync loop on unmount.

## Services Behavior

cacheService.ts:

- In-memory per-device reading cache.
- TTL cleanup logic based on CACHE_TTL_MS.
- Exposes add/get/getAll/clear methods.

syncService.ts:

- Runs periodic interval based on SYNC_INTERVAL_MS.
- Flush cycle:
  - getAllCachedReadings()
  - if non-empty, insertReadings(readings)
  - clearCache()
- No retry/backoff strategy yet.

bluetoothService.ts:

- API exists for startScan, stopScan, readTemperature.
- Current behavior is placeholder logs and dummy values.

thresholdService.ts:

- Intended to create incidents on threshold breaches.
- Current code references non-existent fields from old model names.
- Must be rewritten to align with current Device and Incident types before production use.

exportService.ts:

- exportPdf and exportExcel exist but return empty string placeholders.

notificationService.ts:

- scheduleAlert and requestNotificationPermissions exist as placeholders.

## Permission and Platform Logic

Permission utility in src/utils/permissions.ts:

- iOS:
  - checks foreground location permission.
  - checks location services enabled.

- Android:
  - API 31+: BLUETOOTH_SCAN, BLUETOOTH_CONNECT, ACCESS_FINE_LOCATION.
  - API 29-30: ACCESS_FINE_LOCATION.
  - API 28 and below: ACCESS_COARSE_LOCATION.

- Web:
  - returns granted path.

Settings deep-link helpers:

- openAppSettings uses Linking.openSettings().
- openLocationSettings uses expo-intent-launcher on Android with fallback.

## Build and Run Guide

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npx expo start
```

Run Android native build:

```bash
npx expo run:android
```

Run iOS native build:

```bash
npx expo run:ios
```

iOS generation note:

- On Windows, Expo does not generate iOS native project files.
- Generate iOS native files from macOS or Linux:

```bash
npx expo prebuild --platform ios
```

## Known Gaps and Risks

Critical functional gaps:

1. BLE pipeline not implemented in bluetooth service.
2. Threshold detection service mismatch and not integrated into sync/ingestion flow.
3. Report export does not generate files yet.
4. Notifications are not scheduled or delivered by real provider.

Behavior and consistency caveats:

1. Incidents and notifications include sample/mock fallback data for UI.
2. constants.ts category array omits general while type model includes general.
3. No cloud sync API exists; sync currently means cache-to-local-DB flush.

## Recommended Next Steps

Priority order for production readiness:

1. Rework thresholdService to current schema and connect it to reading ingestion.
2. Implement BLE scanning + reading ingestion and feed cacheService.
3. Implement PDF/Excel generation and persist report file_url.
4. Connect reminders to notification scheduling provider.

## Handoff Conclusion

The project has a solid foundation in navigation, storage, onboarding UI, and visualization. The primary remaining work is integration-level completion for BLE ingestion, threshold eventing, notifications, and report file export.

This README is intended as the primary onboarding artifact for any incoming developer.
