// React imports
import { useState, useRef } from 'react';
// React-native imports
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
// Expo imports
import { Ionicons } from '@expo/vector-icons';
// Theme imports
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
// Store imports
import { useToastStore } from '../store/useToastStore';

interface HeaderProps {
  title: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export default function Header({ title, iconName }: HeaderProps) {
  const showToast = useToastStore((state) => state.showToast);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const optionsButtonRef = useRef<View>(null);

  const openDropdown = () => {
    optionsButtonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setDropdownPosition({ top: pageY + 44, right: spacing.screenMargin });
      setDropdownVisible(true);
    });
  };

  const handleHelpFeedback = async () => {
    setDropdownVisible(false);
    const url = 'mailto:kailashphukan34@gmail.com?subject=Time Tracker Help & Feedback';

    try {
      await Linking.openURL(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'unknown error';
      showToast(`Couldn't open email app: ${errorMessage}`, 'error');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.titleContainer}>
          {iconName && <Ionicons name={iconName} size={24} color={colors.primary} />}
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <View ref={optionsButtonRef} collapsable={false}>
        <TouchableOpacity style={styles.menuButton} onPress={openDropdown}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={StyleSheet.absoluteFill}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[
                  styles.dropdownMenu,
                  { top: dropdownPosition.top, right: dropdownPosition.right },
                ]}
              >
                <TouchableOpacity style={styles.dropdownItem} onPress={handleHelpFeedback}>
                  <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
                  <Text style={styles.dropdownItemText}>Help & feedback</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    color: colors.primary,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  dropdownItemText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
});
