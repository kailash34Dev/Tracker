// React imports
import React, { useEffect, useRef } from 'react';
// React-native imports
import { Animated, Text, StyleSheet } from 'react-native';
// Expo imports
import { Ionicons } from '@expo/vector-icons';
// Store imports
import { useToastStore } from '../store/useToastStore';
// Theme imports
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function GlobalToast() {
  const { visible, message, type, hideToast } = useToastStore();
  const toastAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      toastAnim.setValue(-100); // Reset position for new toasts

      const anim = Animated.sequence([
        Animated.timing(toastAnim, { toValue: 75, duration: 300, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(toastAnim, { toValue: -100, duration: 300, useNativeDriver: true }),
      ]);

      anim.start(({ finished }) => {
        if (finished) {
          hideToast();
        }
      });

      return () => {
        anim.stop(); // Stop animation if message changes to prevent early unmount
      };
    } else {
      // Just in case it gets hidden externally
      toastAnim.setValue(-100);
    }
  }, [visible, message, type, toastAnim, hideToast]);

  // We always render the Animated.View but just move it offscreen when not visible,
  // to prevent unmounting during the exit animation.
  // Actually, since we control visibility with state, the exit animation completes *then* it calls hideToast.
  // So returning null when not visible is perfectly fine here.

  if (!visible) return null;

  const backgroundColor = type === 'error' ? colors.error : colors.primary;
  const iconName = type === 'error' ? 'warning' : 'checkmark-circle';

  return (
    <Animated.View
      style={[styles.toastContainer, { backgroundColor, transform: [{ translateY: toastAnim }] }]}
    >
      <Ionicons name={iconName} size={24} color="#ffffff" />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: '90%',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 9999,
  },
  toastText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
    color: '#ffffff',
    flexShrink: 1,
  },
});
