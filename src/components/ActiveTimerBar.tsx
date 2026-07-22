// React imports
import { memo, useEffect, useRef } from 'react';
// React-native imports
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Expo imports
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

// Store imports
import { useTimerStore } from '../store/useTimerStore';

interface ActiveTimerBarProps {
  taskName: string;
  onTogglePause: () => void;
  onStop: () => void;
  onPress?: () => void;
  onTimerComplete?: (result: any) => void;
}

export default memo(function ActiveTimerBar({
  taskName,
  onTogglePause,
  onStop,
  onPress,
  onTimerComplete,
}: ActiveTimerBarProps) {
  const elapsedSeconds = useTimerStore((state) => state.elapsedSeconds);
  const isPaused = useTimerStore((state) => state.isPaused);
  const activeMode = useTimerStore((state) => state.activeMode);
  const targetDuration = useTimerStore((state) => state.targetDuration);
  const stopTimer = useTimerStore((state) => state.stopTimer);

  useEffect(() => {
    if (activeMode === 'timer' && elapsedSeconds >= targetDuration && targetDuration > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const result = stopTimer();
      if (result && onTimerComplete) {
        onTimerComplete(result);
      }
    }
  }, [activeMode, elapsedSeconds, targetDuration, stopTimer, onTimerComplete]);

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
    const safeSeconds = Math.max(0, totalSeconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

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
          {activeMode === 'timer'
            ? formatTime(Math.max(targetDuration - elapsedSeconds, 0))
            : formatTime(elapsedSeconds)}
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
          <Ionicons name="stop" size={20} color={colors.onCategoryRed} />
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
    flexShrink: 0,
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
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: spacing.sm,
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
