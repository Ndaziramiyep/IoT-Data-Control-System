import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  visible: boolean;
  onEnable: () => void;
  onCancel: () => void;
}

export default function BluetoothPermissionModal({ visible, onEnable, onCancel }: Props) {
  const cardY = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      cardY.setValue(60);
      cardOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(cardY, { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent animationType="none" visible={visible} statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: cardOpacity }]}>
        <Animated.View style={[styles.card, { transform: [{ translateY: cardY }], opacity: cardOpacity }]}>

          <View style={styles.iconWrap}>
            <Ionicons name="bluetooth" size={28} color="#4F6FE8" />
            <Ionicons name="radio-outline" size={14} color="#4F6FE8" style={styles.signalIcon} />
          </View>

          <Text style={styles.title}>Enable Bluetooth</Text>
          <Text style={styles.body}>
            Bluetooth and Location permissions are required. Please enable them to continue.
          </Text>

          <Pressable onPress={onEnable} style={styles.enableBtnWrap}>
            <LinearGradient
              colors={['#6B7FE3', '#9B6FE8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.enableBtn}
            >
              <Text style={styles.enableText}>Enable Bluetooth</Text>
            </LinearGradient>
          </Pressable>

          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0F2FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  signalIcon: {
    position: 'absolute',
    right: 14,
    top: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 2,
  },
  body: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 8,
  },
  enableBtnWrap: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
  },
  enableBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  enableText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F4F6FB',
    alignItems: 'center',
    marginTop: 2,
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
});
