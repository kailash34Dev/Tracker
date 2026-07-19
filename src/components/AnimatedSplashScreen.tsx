import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

export default function AnimatedSplashScreen({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            delay: 100,
            useNativeDriver: true,
          })
        ])
      ]).start(() => {
        onAnimationComplete();
      });
    }, 400); // Wait 400ms before starting animation so user sees the logo steadily for a moment
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Animated.Image 
        // Using the same icon that was configured in app.json for a seamless transition
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
    zIndex: 99999, // Ensure it sits above all navigation stacks
  },
  image: {
    width: 200, // Matches the imageWidth specified in app.json
    height: 200,
  }
});
