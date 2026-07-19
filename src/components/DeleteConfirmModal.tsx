import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

interface DeleteConfirmModalProps {
  visible: boolean;
  taskName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({ visible, taskName, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent={true}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="trash" size={24} color={colors.error} />
          </View>
          
          <Text style={styles.title}>Delete Task?</Text>
          <Text style={styles.subtitle}>
            Are you sure you want to delete <Text style={styles.taskName}>{taskName}</Text>? This action cannot be undone.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deleteButton} onPress={onConfirm} activeOpacity={0.7}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 24, // Fix rounded corners
    padding: spacing.lg,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  taskName: {
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    marginRight: 6,
  },
  cancelText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.error,
    alignItems: 'center',
    marginLeft: 6,
  },
  deleteText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.sm,
    color: '#ffffff', // Ensures text is always visible
  }
});
