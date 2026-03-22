# IoT Data Control System

A React Native (Expo) app for monitoring IoT temperature devices via Bluetooth.

## Stack

- **React Native** + **Expo** — cross-platform mobile
- **expo-sqlite** — local SQLite persistence
- **Zustand** — global state management
- **React Navigation** — stack + tab navigation

## Architecture

| Layer | Path | Purpose |
|---|---|---|
| UI Components | `src/components/` | Reusable widgets |
| Screens | `src/screens/` | Full-page views |
| Database | `src/database/` | SQLite schema + repositories |
| Services | `src/services/` | BLE, cache, sync, export |
| Hooks | `src/hooks/` | Data-fetching hooks |
| Store | `src/store/` | Zustand slices |
| Types | `src/types/` | Shared TypeScript interfaces |
| Utils | `src/utils/` | Constants, formatters, permissions |
| Navigation | `src/navigation/` | App navigator |

## Getting Started

```bash
npm install
npx expo start
```

## Required packages (install before running)

```bash
npx expo install expo-sqlite
npm install zustand @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
```
