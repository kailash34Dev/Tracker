import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Platform, Animated, Easing } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

interface TaskCardProps {
  title: string;
  hours: number;
  iconName: keyof typeof Ionicons.glyphMap;
  theme: 'blue' | 'purple' | 'orange' | 'green' | 'pink' | 'teal' | 'red' | 'indigo' | 'mint' | 'amber';
  isActive?: boolean;
  isPaused?: boolean;
  isPinned?: boolean;
  onPress?: () => void;
  onPlay?: () => void;
  onTogglePause?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  isAnotherTaskActive?: boolean;
}

export default function TaskCard({
  title,
  hours,
  iconName,
  theme,
  isActive = false,
  isPaused = false,
  isPinned = false,
  onPress,
  onPlay,
  onTogglePause,
  onEdit,
  onDelete,
  onPin,
  isAnotherTaskActive = false
}: TaskCardProps) {
  
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const optionsButtonRef = useRef<View>(null);
  const insets = useSafeAreaInsets();
  
  // Animation value for the spinning border
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    
    if (isActive && !isPaused) {
      animation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500, // 1.5 seconds per spin
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
    } else {
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
    
    return () => {
      if (animation) animation.stop();
    };
  }, [isActive, isPaused, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  


  const openDropdown = () => {
    optionsButtonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      // 20px (icon) + 3px (gap) = 23px offset from the top of the button!
      setDropdownPosition({ top: pageY + 23, left: pageX - 160 + width });
      setDropdownVisible(true);
    });
  };

  const handleEdit = () => {
    setDropdownVisible(false);
    onEdit?.();
  };

  const handlePin = () => {
    setDropdownVisible(false);
    onPin?.();
  };

  const handleDelete = () => {
    setDropdownVisible(false);
    onDelete?.();
  };
  
  const themeColors = {
    blue: { bg: colors.categoryBlue, fg: colors.onCategoryBlue },
    purple: { bg: colors.categoryPurple, fg: colors.onCategoryPurple },
    orange: { bg: colors.categoryOrange, fg: colors.onCategoryOrange },
    green: { bg: colors.categoryGreen, fg: colors.onCategoryGreen },
    pink: { bg: colors.categoryPink, fg: colors.onCategoryPink },
    teal: { bg: colors.categoryTeal, fg: colors.onCategoryTeal },
    red: { bg: colors.categoryRed, fg: colors.onCategoryRed },
    indigo: { bg: colors.categoryIndigo, fg: colors.onCategoryIndigo },
    mint: { bg: colors.categoryMint, fg: colors.onCategoryMint },
    amber: { bg: colors.categoryAmber, fg: colors.onCategoryAmber },
  };

  const currentTheme = themeColors[theme];

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { backgroundColor: currentTheme.bg },
        isActive && { borderWidth: 2, borderColor: currentTheme.fg, padding: spacing.md - 2 }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Top Row: Icon & Options */}
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name={iconName} size={24} color={currentTheme.fg} />
        </View>
        <View ref={optionsButtonRef} collapsable={false}>
          <TouchableOpacity onPress={openDropdown} style={styles.optionsButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="ellipsis-horizontal" size={20} color={currentTheme.fg} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Bottom Row: Text & Play Button */}
      <View style={styles.bottomRow}>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            {isPinned && (
              <Ionicons name="pin" size={14} color={currentTheme.fg} style={styles.pinIcon} />
            )}
            <Text style={[styles.title, { color: currentTheme.fg }]} numberOfLines={1}>{title}</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            {hours.toFixed(1)} hrs tracked today
          </Text>
        </View>
        <View style={styles.playButtonContainer}>
          {isActive && !isPaused && (
            <Animated.View 
              style={[
                styles.spinnerRing, 
                { 
                  borderBottomColor: currentTheme.fg, 
                  borderLeftColor: currentTheme.fg,
                  transform: [{ rotate: spin }] 
                }
              ]} 
            />
          )}
          <TouchableOpacity 
            style={[
              styles.playButton, 
              isActive && !isPaused ? { backgroundColor: currentTheme.fg } 
              : isAnotherTaskActive ? { backgroundColor: colors.surfaceVariant } 
              : { backgroundColor: colors.surface }
            ]} 
            onPress={isActive && isPaused ? onTogglePause : onPlay}
          >
            <Ionicons 
              name={isActive && !isPaused ? "stop" : "play"} 
              size={20} 
              color={
                isActive && !isPaused 
                  ? colors.surface 
                  : isAnotherTaskActive 
                    ? colors.onSurfaceVariant 
                    : currentTheme.fg
              } 
              style={(!isActive || isPaused) && { marginLeft: 2 }} // center the play icon visually
            />
          </TouchableOpacity>
        </View>
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
            <TouchableWithoutFeedback>
              <View style={[styles.dropdownMenu, { top: dropdownPosition.top, left: dropdownPosition.left }]}>
                <TouchableOpacity style={styles.dropdownItem} onPress={handlePin}>
                  <Ionicons name={isPinned ? "pin-outline" : "pin"} size={18} color={colors.primary} />
                  <Text style={styles.dropdownItemText}>{isPinned ? "Unpin Task" : "Pin Task"}</Text>
                </TouchableOpacity>
                <View style={styles.dropdownDivider} />
                <TouchableOpacity 
                  style={[styles.dropdownItem, isActive && { opacity: 0.4 }]} 
                  onPress={handleEdit} 
                  disabled={isActive}
                >
                  <Ionicons name="pencil" size={18} color={colors.primary} />
                  <Text style={styles.dropdownItemText}>Edit Task</Text>
                </TouchableOpacity>
                <View style={styles.dropdownDivider} />
                <TouchableOpacity 
                  style={[styles.dropdownItem, isActive && { opacity: 0.4 }]} 
                  onPress={handleDelete} 
                  disabled={isActive}
                >
                  <Ionicons name="trash" size={18} color={colors.error} />
                  <Text style={[styles.dropdownItemText, { color: colors.error }]}>Delete Task</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsButton: {
    padding: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pinIcon: {
    marginRight: 4,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    flexShrink: 1,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
  },
  playButtonContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
  },
  spinnerRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownMenu: {
    position: 'absolute',
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    shadowColor: "#000",
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
  dropdownDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  }
});
