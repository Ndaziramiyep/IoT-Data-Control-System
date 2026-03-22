import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Header title="Notifications" />
      <FlatList
        data={[]}
        keyExtractor={item => item}
        renderItem={({ item }) => <Text>{item}</Text>}
        contentContainerStyle={styles.empty}
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999' },
});
