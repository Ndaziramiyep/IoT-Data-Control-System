import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function Button({ label, onPress, disabled }: ButtonProps) {
  return (
    <TouchableOpacity style={[styles.btn, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  text: { color: '#fff', fontWeight: '600' },
});
