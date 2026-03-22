import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import KumvaLogo from '../components/common/KumvaLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity }}>
        <KumvaLogo size="large" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF1F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
