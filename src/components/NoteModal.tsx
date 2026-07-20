// React imports
import React, { useState, useEffect } from 'react';
// React-native imports
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
// Theme imports
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

interface NoteModalProps {
  visible: boolean;
  taskName: string | null;
  onClose: () => void;
  onSubmit: (note: string | null) => void;
}

export default function NoteModal({ visible, taskName, onClose, onSubmit }: NoteModalProps) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!visible) {
      setNote('');
    }
  }, [visible]);

  const handleSubmit = () => {
    onSubmit(note.trim().length > 0 ? note.trim() : null);
    setNote('');
  };

  const handleSkip = () => {
    onSubmit(null);
    setNote('');
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Session Note</Text>
            <Text style={styles.subtitle}>
              What did you work on for &quot;{taskName || 'this task'}&quot;?
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Add a note (optional)..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
              autoFocus
              textAlignVertical="top"
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSubmit}
                activeOpacity={0.7}
              >
                <Text style={styles.saveText}>Save Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 340,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    padding: spacing.md,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    color: colors.onSurface,
    minHeight: 100,
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    marginRight: 6,
  },
  skipText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    marginLeft: 6,
  },
  saveText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.sm,
    color: '#ffffff',
  },
});
