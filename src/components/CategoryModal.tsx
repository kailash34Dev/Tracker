import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Animated, Easing, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
import SearchBar from './SearchBar';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, theme: string, id?: string) => void;
  initialData?: { id: string; title: string; theme: string } | null;
  existingTaskNames?: string[];
}

export default function CategoryModal({ visible, onClose, onSubmit, initialData, existingTaskNames }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('random');
  const [error, setError] = useState<string | null>(null);
  const animatedPadding = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      let paddingValue = e.endCoordinates.height;
      
      if (Platform.OS === 'android') {
        const windowHeight = Dimensions.get('window').height;
        const screenHeight = Dimensions.get('screen').height;
        
        // On older Androids (or specific OS skins), the system automatically resizes the window 
        // to fit the keyboard, even with edge-to-edge enabled.
        // If the window shrank significantly, the OS already did the work, so we shouldn't add padding.
        if ((screenHeight - windowHeight) > 150) {
          paddingValue = 0;
        }
      }

      Animated.timing(animatedPadding, {
        toValue: paddingValue,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(animatedPadding, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [animatedPadding]);

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

  const themes = [
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

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Task name cannot be empty.');
      return;
    }

    if (existingTaskNames) {
      const isDuplicate = existingTaskNames.some(
        taskName => taskName.toLowerCase() === trimmedName.toLowerCase() && 
                    (!initialData || initialData.title.toLowerCase() !== trimmedName.toLowerCase())
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent={true}>
      <Animated.View style={[styles.overlay, { paddingBottom: animatedPadding }]}>
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
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
            onChangeText={(text) => { setName(text); setError(null); }}
            placeholder="e.g. Study, Coding..."
            icon="pencil"
            autoFocus
          />
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.label}>Theme Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeSelectorScrollView} contentContainerStyle={styles.themeSelector}>
            <TouchableOpacity
              style={[
                styles.themeCircle,
                { backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' },
                theme === 'random' && styles.themeCircleSelected
              ]}
              onPress={() => setTheme('random')}
            >
              <Ionicons name="shuffle" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>

            {themes.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.themeCircle,
                  { backgroundColor: t.color },
                  theme === t.id && styles.themeCircleSelected
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
}

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
    paddingBottom: spacing.xl * 2, // Extra padding for safe area
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
    marginTop: -8,
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
