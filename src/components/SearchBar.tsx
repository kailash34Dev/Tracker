import { memo } from 'react';
// React-native imports
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
// Expo imports
import { Ionicons } from '@expo/vector-icons';
// Theme imports
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  autoFocus?: boolean;
}

export default memo(function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search tasks...',
  icon = 'search',
  autoFocus = false,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={20} color={colors.onSurfaceVariant} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant}
        autoFocus={autoFocus}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
          <Ionicons name="close-circle" size={22} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.onSurface,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});
