import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type NotifType = 'weekly' | 'monthly';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1', type: 'weekly',
    title: 'Weekly Report Reminder',
    body: "It's time to generate your weekly temperature report for the main storage unit.",
    timestamp: Date.now() - 60 * 1000,
    read: false,
  },
  {
    id: '2', type: 'weekly',
    title: 'Weekly Report Reminder',
    body: 'System performance logs for last week are ready for export and review.',
    timestamp: new Date('2026-03-09T08:00:00').getTime(),
    read: true,
  },
  {
    id: '3', type: 'monthly',
    title: 'Monthly Report Reminder',
    body: 'Complete monthly temperature trend analysis is available for download.',
    timestamp: new Date('2026-03-01T09:15:00').getTime(),
    read: true,
  },
  {
    id: '4', type: 'weekly',
    title: 'Weekly Report Reminder',
    body: "It's time to generate your weekly temperature report.",
    timestamp: new Date('2026-02-23T08:00:00').getTime(),
    read: true,
  },
  {
    id: '5', type: 'weekly',
    title: 'Weekly Report Reminder',
    body: "It's time to generate your weekly temperature report.",
    timestamp: new Date('2026-02-16T08:00:00').getTime(),
    read: true,
  },
];

function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 2 * 60 * 1000) return 'JUST NOW';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
    + ' — '
    + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function NotifIcon({ type }: { type: NotifType }) {
  return (
    <View style={[styles.iconWrap, { backgroundColor: type === 'monthly' ? '#EDE9FE' : '#EEF0FB' }]}>
      <Ionicons
        name={type === 'monthly' ? 'bar-chart-outline' : 'calendar-outline'}
        size={20}
        color={type === 'monthly' ? '#7C3AED' : '#5C6BC0'}
      />
    </View>
  );
}

export default function NotificationsScreen({ navigation }: any) {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const displayed = tab === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const deleteNotif = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'all' && styles.tabActive]}
          onPress={() => setTab('all')}
        >
          <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'unread' && styles.tabActive]}
          onPress={() => setTab('unread')}
        >
          <Text style={[styles.tabText, tab === 'unread' && styles.tabTextActive]}>Unread</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={displayed}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
        renderItem={({ item }) => {
          const timeStr = formatTimestamp(item.timestamp);
          const isJustNow = timeStr === 'JUST NOW';
          return (
            <View style={styles.item}>
              <NotifIcon type={item.type} />
              <View style={styles.itemBody}>
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {isJustNow && <Text style={styles.justNow}>JUST NOW</Text>}
                </View>
                <Text style={styles.itemText}>{item.body}</Text>
                {!isJustNow && <Text style={styles.itemTime}>{timeStr}</Text>}
              </View>
              <TouchableOpacity onPress={() => deleteNotif(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color="#C4C4C4" />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0E0E0',
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  tabRow: {
    flexDirection: 'row', margin: 16, marginBottom: 8,
    backgroundColor: '#F4F6FB', borderRadius: 12, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#5C6BC0' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#F0F0F0', marginVertical: 4 },
  item: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  itemBody: { flex: 1, gap: 3 },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  justNow: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.5 },
  itemText: { fontSize: 13, color: '#6B7280', lineHeight: 19 },
  itemTime: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  deleteBtn: { padding: 4, marginTop: 2 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
});
