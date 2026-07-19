import React from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

interface ConflictModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConflictModal({ visible, onCancel, onConfirm }: ConflictModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <View style={styles.conflictModalContainer}>
          <View style={styles.conflictIconContainer}>
            <Ionicons name="warning" size={24} color={colors.error} />
          </View>
          <Text style={styles.conflictTitle}>Task in Progress</Text>
          <Text style={styles.conflictSubtitle}>
            Another task is currently active. Would you like to stop it and start this one?
          </Text>
          <View style={styles.conflictButtonContainer}>
            <TouchableOpacity
              style={styles.conflictCancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.conflictCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.conflictConfirmButton}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.conflictConfirmText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  conflictModalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  conflictIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  conflictTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  conflictSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  conflictButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  conflictCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    marginRight: 6,
  },
  conflictCancelText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  conflictConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.error,
    alignItems: 'center',
    marginLeft: 6,
  },
  conflictConfirmText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.sm,
    color: '#ffffff',
  },
});
