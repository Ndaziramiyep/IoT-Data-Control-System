// Placeholder — integrate with expo-notifications
export async function scheduleAlert(title: string, body: string): Promise<void> {
  // TODO: use Notifications.scheduleNotificationAsync
  console.log('Notification:', title, body);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  // TODO: use Notifications.requestPermissionsAsync
  return true;
}
