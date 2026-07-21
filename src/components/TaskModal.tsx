// React imports
import { useState, useEffect, memo, useRef } from 'react';
// React-native imports
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
// Expo imports
import { Ionicons } from '@expo/vector-icons';
// Theme imports
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
// Component imports
import SearchBar from './SearchBar';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, theme: string, id?: string) => void;
  initialData?: { id: string; title: string; theme: string } | null;
  existingTaskNames?: string[];
}

const THEMES = [
  { id: 'blue', color: colors.categoryBlue },
  { id: 'purple', color: colors.categoryPurple },
  { id: 'orange', color: colors.categoryOrange },
  { id: 'green', color: colors.categoryGreen },
  { id: 'pink', color: colors.categoryPink },
  { id: 'teal', color: colors.categoryTeal },
  { id: 'red', color: colors.categoryRed },
  { id: 'indigo', color: colors.categoryIndigo },
  { id: 'mint', color: colors.categoryMint },
  { id: 'amber', color: colors.categoryAmber },
];

export default memo(function TaskModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  existingTaskNames,
}: TaskModalProps) {
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('random');
  const [error, setError] = useState<string | null>(null);

  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const isManualKeyboardNeeded =
      Platform.OS === 'ios' || (Platform.OS === 'android' && (Platform.Version as number) >= 30);

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        if (isManualKeyboardNeeded) {
          Animated.timing(keyboardOffset, {
            toValue: e.endCoordinates.height,
            duration: e.duration || 250,
            useNativeDriver: false,
          }).start();
        }
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        if (isManualKeyboardNeeded) {
          Animated.timing(keyboardOffset, {
            toValue: 0,
            duration: e.duration || 250,
            useNativeDriver: false,
          }).start();
        }
      },
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardOffset]);

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setName(initialData.title || '');
        setTheme(initialData.theme || 'random');
      } else {
        setName('');
        setTheme('random');
      }
      setError(null);
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Task name cannot be empty.');
      return;
    }

    if (trimmedName.length > 25) {
      setError('Task name cannot exceed 25 characters.');
      return;
    }

    if (existingTaskNames) {
      const isDuplicate = existingTaskNames.some(
        (taskName) =>
          taskName.toLowerCase() === trimmedName.toLowerCase() &&
          (!initialData || initialData.title.toLowerCase() !== trimmedName.toLowerCase()),
      );
      if (isDuplicate) {
        setError('A task with this name already exists.');
        return;
      }
    }

    onSubmit(trimmedName, theme, initialData?.id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.overlay, { paddingBottom: keyboardOffset }]}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        >
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{initialData ? 'Edit Task' : 'New Task'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Name</Text>
          <SearchBar
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError(null);
            }}
            placeholder="e.g. Study, Coding..."
            icon="pencil"
            autoFocus
            maxLength={25}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.label}>Theme Color</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.themeSelectorScrollView}
            contentContainerStyle={styles.themeSelector}
          >
            <TouchableOpacity
              style={[
                styles.themeCircle,
                {
                  backgroundColor: colors.surfaceVariant,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                theme === 'random' && styles.themeCircleSelected,
              ]}
              onPress={() => setTheme('random')}
            >
              <Ionicons name="shuffle" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>

            {THEMES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.themeCircle,
                  { backgroundColor: t.color },
                  theme === t.id && styles.themeCircleSelected,
                ]}
                onPress={() => setTheme(t.id)}
              />
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>{initialData ? 'Save Changes' : 'Create'}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    color: colors.primary,
  },
  label: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  errorText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: 10,
    marginBottom: 8,
    marginLeft: spacing.xs,
  },
  themeSelectorScrollView: {
    marginBottom: spacing.xl,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    paddingVertical: 4,
  },
  themeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCircleSelected: {
    borderColor: colors.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  submitText: {
    fontFamily: typography.fontFamily.bold,
    color: colors.onPrimary,
    fontSize: typography.sizes.md,
  },
});
