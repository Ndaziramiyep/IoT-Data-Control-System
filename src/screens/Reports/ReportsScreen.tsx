import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';
import FilterBar from '../../components/report/FilterBar';
import ExportButton from '../../components/report/ExportButton';

export default function ReportsScreen() {
  const [filter, setFilter] = useState('Today');

  return (
    <View style={styles.container}>
      <Header title="Reports" />
      <View style={styles.body}>
        <FilterBar selected={filter} onSelect={setFilter} />
        <ExportButton onExport={format => console.log('Export', format)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { padding: 16, gap: 16 },
});
