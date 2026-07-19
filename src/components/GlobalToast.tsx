import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToastStore } from '../store/useToastStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function GlobalToast() {
  const { visible, message, hideToast } = useToastStore();
  const toastAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(toastAnim, { toValue: 75, duration: 300, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(toastAnim, { toValue: -100, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        hideToast();
      });
    } else {
      // Just in case it gets hidden externally
      toastAnim.setValue(-100);
    }
  }, [visible, toastAnim, hideToast]);

  // We always render the Animated.View but just move it offscreen when not visible,
  // to prevent unmounting during the exit animation.
  // Actually, since we control visibility with state, the exit animation completes *then* it calls hideToast.
  // So returning null when not visible is perfectly fine here.
  
  if (!visible) return null;

  return (
    <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
      <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
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
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 9999, // very high to appear over everything
  },
  toastText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
    color: '#ffffff',
  },
});
