// React imports
import React, { useEffect, useRef } from 'react';
// React-natve imports
import { Animated, StyleSheet } from 'react-native';

export default function AnimatedSplashScreen({
  onAnimationComplete,
}: {
  onAnimationComplete: () => void;
}) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.8,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            delay: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onAnimationComplete();
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [onAnimationComplete, opacity, scale]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Animated.Image
        source={require('../../assets/images/icon.png')}
        style={[styles.image, { transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  image: {
    width: 200,
    height: 200,
  },
});
