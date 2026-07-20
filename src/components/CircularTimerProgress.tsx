// React imports
import React, { useEffect, useRef } from 'react';
// React-native imports
import { View, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularTimerProgressProps {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  trackColor?: string;
  children?: React.ReactNode;
}

export const CircularTimerProgress = ({
  size,
  strokeWidth,
  progress,
  color,
  trackColor = 'rgba(255,255,255,0.1)',
  children,
}: CircularTimerProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const animatedProgress = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedProgress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      pointerEvents="none"
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={trackColor} />
            <Stop offset="100%" stopColor={color} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {children}
    </View>
  );
};
