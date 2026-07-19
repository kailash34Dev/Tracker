import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useState, useRef, useEffect, memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

interface ActiveTimerBarProps {
  taskName: string;
  elapsedSeconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onStop: () => void;
  onPress?: () => void;
}

export default memo(function ActiveTimerBar({
  taskName,
  elapsedSeconds,
  isPaused,
  onTogglePause,
  onStop,
  onPress,
}: ActiveTimerBarProps) {
  // Animation value for the pulsing dot
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (!isPaused) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 0.3,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    } else {
      pulseValue.setValue(1); // Solid when paused
    }

    return () => {
      if (animation) animation.stop();
    };
  }, [pulseValue, isPaused]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      {/* Row 1: Header */}
      <View style={styles.headerRow}>
        <View style={styles.leftTitleGroup}>
          <Animated.View
            style={[
              styles.pulseDot,
              {
                opacity: pulseValue,
                backgroundColor: isPaused ? colors.categoryOrange : colors.error,
              },
            ]}
          />
          <Text style={styles.label}>{isPaused ? 'Paused' : 'Live Tracking'}</Text>
        </View>
        <Text style={styles.taskName} numberOfLines={1}>
          {taskName}
        </Text>
      </View>

      {/* Row 2: Timer */}
      <View style={styles.timerRow}>
        <Text style={[styles.timerText, isPaused && styles.timerTextPaused]}>
          {formatTime(elapsedSeconds)}
        </Text>
      </View>

      {/* Row 3: Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} onPress={onTogglePause} activeOpacity={0.7}>
          <Ionicons name={isPaused ? 'play' : 'pause'} size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.stopButton]}
          onPress={onStop}
          activeOpacity={0.7}
        >
          <Ionicons name="stop" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: colors.primary, // Dark mode card
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 20, // Smaller card radius
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  leftTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    shadowColor: colors.error,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  taskName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.onPrimary,
  },
  timerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  timerText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 40, // Reduced from 56
    color: colors.onPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  timerTextPaused: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 48, // Reduced from 64
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.sm, // Spacing between buttons
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  stopButton: {
    backgroundColor: colors.categoryRed,
  },
});
