// React imports
import React, { useRef, useState, useEffect } from 'react';
// React-native imports
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
  FlatList,
  ListRenderItem,
} from 'react-native';
// Expo imports
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
// Theme imports
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

const ITEM_HEIGHT = 60;

interface WheelPickerProps {
  items: number[];
  selectedValue: number;
  onValueChange: (val: number) => void;
  label: string;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const WheelPicker = ({ items, selectedValue, onValueChange, label }: WheelPickerProps) => {
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const REPEAT_COUNT = 100;
  const repeatedItems = React.useMemo(() => Array(REPEAT_COUNT).fill(items).flat(), [items]);
  const middleIndex = Math.floor(REPEAT_COUNT / 2) * items.length;

  const lastProcessedValue = useRef(selectedValue);
  const isInitialized = useRef(false);
  const hapticsEnabled = useRef(false);

  useEffect(() => {
    // Only snap if this is the first initialization or if selectedValue changed externally
    if (!isInitialized.current || selectedValue !== lastProcessedValue.current) {
      const valueIndex = items.indexOf(selectedValue);
      if (valueIndex >= 0 && flatListRef.current) {
        const targetIndex = middleIndex + valueIndex;
        setTimeout(() => {
          hapticsEnabled.current = false;
          flatListRef.current?.scrollToOffset({
            offset: targetIndex * ITEM_HEIGHT,
            animated: false,
          });
          setTimeout(() => {
            hapticsEnabled.current = true;
          }, 100);
        }, 50);
      }
      isInitialized.current = true;
      lastProcessedValue.current = selectedValue;
    }
  }, [selectedValue, items, middleIndex]);

  useEffect(() => {
    let lastIndex = -1;
    const listenerId = scrollY.addListener(({ value }) => {
      const currentIndex = Math.round(value / ITEM_HEIGHT);
      if (hapticsEnabled.current && lastIndex !== -1 && currentIndex !== lastIndex) {
        Haptics.selectionAsync().catch(() => {});
      }
      lastIndex = currentIndex;
    });
    return () => scrollY.removeListener(listenerId);
  }, [scrollY]);

  const handleMomentumScrollEnd = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < repeatedItems.length) {
      const val = repeatedItems[index];
      if (val !== selectedValue) {
        lastProcessedValue.current = val;
        onValueChange(val);
      }
    }
  };

  const renderItem: ListRenderItem<number> = ({ item, index }) => {
    const inputRange = [
      (index - 2) * ITEM_HEIGHT,
      (index - 1) * ITEM_HEIGHT,
      index * ITEM_HEIGHT,
      (index + 1) * ITEM_HEIGHT,
      (index + 2) * ITEM_HEIGHT,
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.6, 0.8, 1, 0.8, 0.6],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.2, 0.4, 1, 0.4, 0.2],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.wheelItem, { transform: [{ scale }], opacity }]}>
        <Text style={styles.wheelItemText}>{item.toString().padStart(2, '0')}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.wheelContainer}>
      <Text style={styles.wheelLabel}>{label}</Text>
      <View style={styles.pickerWindow} pointerEvents="none" />
      <AnimatedFlatList
        ref={flatListRef as any}
        data={repeatedItems}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem as ListRenderItem<unknown>}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
};

interface CustomTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (hours: number, minutes: number, seconds: number) => void;
  initialTotalSeconds: number;
  themeColor: string;
}

export const CustomTimePickerModal = ({
  visible,
  onClose,
  onSave,
  initialTotalSeconds,
  themeColor,
}: CustomTimePickerModalProps) => {
  const [hours, setHours] = useState(Math.floor(initialTotalSeconds / 3600));
  const [minutes, setMinutes] = useState(Math.floor((initialTotalSeconds % 3600) / 60));
  const [seconds, setSeconds] = useState(initialTotalSeconds % 60);

  useEffect(() => {
    if (visible) {
      setHours(Math.floor(initialTotalSeconds / 3600));
      setMinutes(Math.floor((initialTotalSeconds % 3600) / 60));
      setSeconds(initialTotalSeconds % 60);
    }
  }, [visible, initialTotalSeconds]);

  const handleSave = () => {
    if (hours === 0 && minutes === 0 && seconds === 0) return;
    onSave(hours, minutes, seconds);
  };

  const hourItems = Array.from({ length: 24 }, (_, i) => i);
  const minuteItems = Array.from({ length: 60 }, (_, i) => i);
  const secondItems = Array.from({ length: 60 }, (_, i) => i);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerIcon}>
              <Ionicons name="chevron-down" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, { backgroundColor: themeColor }]}
            >
              <Ionicons name="add" size={20} color={colors.surface} />
              <Text style={[styles.saveText, { color: colors.surface }]}>Set Timer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickersContainer}>
            <WheelPicker
              items={hourItems}
              selectedValue={hours}
              onValueChange={setHours}
              label="Hr"
            />
            <Text style={styles.colon}>:</Text>
            <WheelPicker
              items={minuteItems}
              selectedValue={minutes}
              onValueChange={setMinutes}
              label="Min"
            />
            <Text style={styles.colon}>:</Text>
            <WheelPicker
              items={secondItems}
              selectedValue={seconds}
              onValueChange={setSeconds}
              label="Sec"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
    height: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xl,
  },
  headerIcon: {
    padding: spacing.xs,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  saveText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
  },
  pickersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * 5,
  },
  wheelContainer: {
    width: 90,
    alignItems: 'center',
    height: '100%',
    overflow: 'visible',
  },
  wheelLabel: {
    position: 'absolute',
    top: -24,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    color: colors.onSurfaceVariant,
    zIndex: 10,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 32,
    color: colors.onSurface,
  },
  colon: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 24,
    color: colors.onSurfaceVariant,
    paddingBottom: spacing.md,
  },
  pickerWindow: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2 - 4,
    width: 80,
    height: ITEM_HEIGHT + 8,
    backgroundColor: colors.surfaceVariant,
    opacity: 0.3,
    borderRadius: radius.md,
  },
});
