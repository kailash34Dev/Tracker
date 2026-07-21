// React-native imports
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Expo imports
import { Ionicons } from '@expo/vector-icons';
// Theme imports
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface CreateTaskButtonProps {
  onPress: () => void;
}

export default function CreateTaskButton({ onPress }: CreateTaskButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name="add" size={20} color={colors.surface} />
      </View>
      <Text style={styles.text}>Create New Task</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  text: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.md,
    color: colors.onSurface,
  },
});
