import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onEnable: () => void;
  onCancel: () => void;
}

function PulseRing() {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          ]),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
    pulse(ring1, 0).start();
    pulse(ring2, 600).start();
  }, []);

  const ringStyle = (anim: Animated.Value) => ({
    position: 'absolute' as const,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#5C6BC0',
    opacity: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.6, 0.4, 0] }),
    transform: [{
      scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }),
    }],
  });

  return (
    <>
      <Animated.View style={ringStyle(ring1)} />
      <Animated.View style={ringStyle(ring2)} />
    </>
  );
}

function AnimatedButton({ onPress, style, textStyle, label }: {
  onPress: () => void;
  style: object;
  textStyle: object;
  label: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, friction: 8 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        <Text style={textStyle}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function BluetoothPermissionModal({ visible, onEnable, onCancel }: Props) {
  const cardY = useRef(new Animated.Value(80)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (visible) {
      cardY.setValue(80);
      cardOpacity.setValue(0);
      iconScale.setValue(0.6);
      Animated.parallel([
        Animated.spring(cardY, { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(iconScale, { toValue: 1, friction: 5, tension: 80, delay: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent animationType="none" visible={visible} statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: cardOpacity }]}>
        <Animated.View style={[
          styles.card,
          { transform: [{ translateY: cardY }], opacity: cardOpacity },
        ]}>
          {/* Animated icon */}
          <View style={styles.iconContainer}>
            <PulseRing />
            <Animated.View style={[styles.iconWrap, { transform: [{ scale: iconScale }] }]}>
              <Ionicons name="bluetooth" size={30} color="#5C6BC0" />
            </Animated.View>
          </View>

          <Text style={styles.title}>Enable Bluetooth</Text>
          <Text style={styles.body}>
            Bluetooth permission is required. Please{'\n'}enable it to continue.
          </Text>

          <AnimatedButton
            onPress={onEnable}
            label="Enable Bluetooth"
            style={styles.enableBtn}
            textStyle={styles.enableText}
          />
          <AnimatedButton
            onPress={onCancel}
            label="Cancel"
            style={styles.cancelBtn}
            textStyle={styles.cancelText}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF0FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1C1C1E', textAlign: 'center' },
  body: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 21 },
  enableBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#5C6BC0',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#5C6BC0',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  enableText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F4F6FB',
    alignItems: 'center',
  },
  cancelText: { color: '#6B7280', fontSize: 15, fontWeight: '600' },
});
