import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  PanResponder,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { useTimerStore } from '../../src/store/useTimerStore';
import { useToastStore } from '../../src/store/useToastStore';
import ConflictModal from '../../src/components/ConflictModal';
import { CustomTimePickerModal } from '../../src/components/CustomTimePickerModal';
import { CircularTimerProgress } from '../../src/components/CircularTimerProgress';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useDatabaseMutations } from '../../src/hooks/useDatabase';
import NoteModal from '../../src/components/NoteModal';

const themeMap: Record<string, { pastel: string; border: string }> = {
  blue: { pastel: colors.categoryBlue, border: colors.onCategoryBlue },
  purple: { pastel: colors.categoryPurple, border: colors.onCategoryPurple },
  orange: { pastel: colors.categoryOrange, border: colors.onCategoryOrange },
  green: { pastel: colors.categoryGreen, border: colors.onCategoryGreen },
  pink: { pastel: colors.categoryPink, border: colors.onCategoryPink },
  teal: { pastel: colors.categoryTeal, border: colors.onCategoryTeal },
  red: { pastel: colors.categoryRed, border: colors.onCategoryRed },
  indigo: { pastel: colors.categoryIndigo, border: colors.onCategoryIndigo },
  mint: { pastel: colors.categoryMint, border: colors.onCategoryMint },
  amber: { pastel: colors.categoryAmber, border: colors.onCategoryAmber },
};

const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function TaskScreen() {
  const router = useRouter();
  const { id, title, hours, icon, theme } = useLocalSearchParams();

  const { activeTaskId, elapsedSeconds, isPaused, togglePause, stopTimer, startTimer } =
    useTimerStore();
  const taskId = Number(id);
  const isActive = activeTaskId === taskId;
  const isAnotherTaskActive = activeTaskId !== null && activeTaskId !== taskId;

  const { recordTimeSession } = useDatabaseMutations();
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [pendingSession, setPendingSession] = useState<any>(null);

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

  const handleHelpFeedback = () => {
    setDropdownVisible(false);
    Alert.alert('Help & Feedback', 'Coming soon!');
  };

  const [mode, setMode] = useState<'stopwatch' | 'timer'>('stopwatch');
  const [selectedDuration, setSelectedDuration] = useState<number>(30 * 60);

  const standardDurations = [15 * 60, 30 * 60, 45 * 60, 60 * 60, 120 * 60, 180 * 60];
  const isStandardDuration = standardDurations.includes(selectedDuration);

  const [isCustomModalVisible, setIsCustomModalVisible] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [isConflictModalVisible, setIsConflictModalVisible] = useState(false);

  const [segmentWidth, setSegmentWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(mode === 'stopwatch' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: mode === 'stopwatch' ? 0 : 1,
      useNativeDriver: true,
      bounciness: 0,
      speed: 12,
    }).start();
  }, [mode, slideAnim]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, (segmentWidth - 8) / 2)],
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Detect horizontal swipe
        return (
          Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!isActive) {
          if (gestureState.dx > 20) {
            // Swiped right -> go to Stopwatch (which is on the left)
            setMode('stopwatch');
          } else if (gestureState.dx < -20) {
            // Swiped left -> go to Timer (which is on the right)
            setMode('timer');
          }
        }
      },
    }),
  ).current;

  const themeData = themeMap[theme as string] || themeMap.purple;

  // Animation value for the pulse dot
  const pulseAnim = useSharedValue(0);
  const circlePulseAnim = useSharedValue(1);

  useEffect(() => {
    if (isActive && !isPaused) {
      pulseAnim.value = withRepeat(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1, // infinite
        true, // auto-reverse (1 -> 0 -> 1)
      );

      circlePulseAnim.value = withRepeat(
        withTiming(1.04, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      cancelAnimation(pulseAnim);
      cancelAnimation(circlePulseAnim);
      pulseAnim.value = withTiming(0, { duration: 400 });
      circlePulseAnim.value = withTiming(1, { duration: 400 });
    }
  }, [isActive, isPaused]);

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseAnim.value, [0, 1], [0.2, 1]),
  }));

  const glowRingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(circlePulseAnim.value, [1, 1.04], [0, 0.2]),
    transform: [{ scale: interpolate(circlePulseAnim.value, [1, 1.04], [1, 1.15]) }],
  }));

  const timerCircleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circlePulseAnim.value }],
  }));

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isActive) {
      togglePause();
    }
  };

  const handleStop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isActive) {
      const result = stopTimer();
      if (result) {
        setPendingSession({ ...result, taskName: title as string });
        setNoteModalVisible(true);
      }
    }
  };

  const handleSaveSession = async (note: string | null) => {
    if (pendingSession) {
      await recordTimeSession(
        pendingSession.taskId,
        pendingSession.startTime,
        pendingSession.endTime,
        pendingSession.seconds,
        note,
      );
      setPendingSession(null);
      showToast('Session saved successfully!');
    }
    setNoteModalVisible(false);
  };

  const handlePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isAnotherTaskActive) {
      setIsConflictModalVisible(true);
      return;
    }
    if (!isActive) {
      startTimer(taskId, title as string);
    } else if (isPaused) {
      togglePause();
    }
  };

  const progressHours = Math.floor(Number(hours || 0));
  const progressMins = Math.round((Number(hours || 0) - progressHours) * 60);
  const progressText = `${progressHours}h ${progressMins}m`;

  const displayedSeconds =
    mode === 'timer'
      ? Math.max(selectedDuration - (isActive ? elapsedSeconds : 0), 0)
      : isActive
        ? elapsedSeconds
        : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View ref={optionsButtonRef} collapsable={false}>
          <TouchableOpacity style={styles.headerButton} onPress={openDropdown}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Segmented Control */}
        <View
          style={styles.segmentedControl}
          onLayout={(e) => setSegmentWidth(e.nativeEvent.layout.width)}
        >
          {segmentWidth > 0 && (
            <Animated.View
              style={[
                styles.segmentButtonActiveBackground,
                {
                  position: 'absolute',
                  top: 4,
                  bottom: 4,
                  left: 4,
                  width: (segmentWidth - 8) / 2,
                  transform: [{ translateX }],
                },
              ]}
            />
          )}
          <TouchableOpacity
            style={styles.segmentButton}
            onPress={() => !isActive && setMode('stopwatch')}
            disabled={isActive}
          >
            <Ionicons
              name="stopwatch-outline"
              size={18}
              color={mode === 'stopwatch' ? colors.onSurface : colors.onSurfaceVariant}
            />
            <Text style={[styles.segmentText, mode === 'stopwatch' && styles.segmentTextActive]}>
              Stopwatch
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.segmentButton}
            onPress={() => !isActive && setMode('timer')}
            disabled={isActive}
          >
            <Ionicons
              name="timer-outline"
              size={18}
              color={mode === 'timer' ? colors.onSurface : colors.onSurfaceVariant}
            />
            <Text style={[styles.segmentText, mode === 'timer' && styles.segmentTextActive]}>
              Timer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Timer Section */}
        <View style={styles.timerSection} {...panResponder.panHandlers}>
          {mode === 'stopwatch' ? (
            <>
              {/* Active Glow Ring Animation */}
              <Reanimated.View
                style={[
                  {
                    position: 'absolute',
                    width: 260,
                    height: 260,
                    borderRadius: 130,
                    backgroundColor: themeData.border,
                  },
                  glowRingAnimatedStyle,
                ]}
              />

              <Reanimated.View
                style={[
                  styles.timerCircle,
                  { shadowColor: themeData.border },
                  timerCircleAnimatedStyle,
                ]}
              >
                <Text style={styles.timerText}>{formatTime(displayedSeconds)}</Text>

                <View style={[styles.pill, { backgroundColor: themeData.pastel }]}>
                  <Reanimated.View
                    style={[
                      styles.pulseDot,
                      { backgroundColor: themeData.border },
                      isActive && !isPaused ? pulseAnimatedStyle : { opacity: 1 },
                    ]}
                  />
                  <Text style={[styles.pillText, { color: themeData.border }]}>
                    {title || 'Focus Time'}
                  </Text>
                </View>
              </Reanimated.View>
            </>
          ) : (
            <View style={{ marginBottom: spacing.xl }}>
              <CircularTimerProgress
                size={280}
                strokeWidth={12}
                progress={selectedDuration > 0 ? displayedSeconds / selectedDuration : 0}
                color={themeData.border}
                trackColor={themeData.pastel}
              >
                <View
                  style={[
                    styles.timerCircle,
                    { width: 256, height: 256, borderRadius: 128, marginBottom: 0 },
                  ]}
                >
                  <Text style={styles.timerText}>{formatTime(displayedSeconds)}</Text>

                  <View style={[styles.pill, { backgroundColor: themeData.pastel }]}>
                    <Reanimated.View
                      style={[
                        styles.pulseDot,
                        { backgroundColor: themeData.border },
                        isActive && !isPaused ? pulseAnimatedStyle : { opacity: 1 },
                      ]}
                    />
                    <Text style={[styles.pillText, { color: themeData.border }]}>
                      {title || 'Focus Time'}
                    </Text>
                  </View>
                </View>
              </CircularTimerProgress>
            </View>
          )}

          {/* Quick Time Selectors */}
          {mode === 'timer' && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                marginBottom: spacing.xl,
                gap: 12,
              }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ gap: 12 }}
              >
                {standardDurations.map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.timeSelector,
                      selectedDuration === duration && {
                        borderColor: themeData.border,
                        backgroundColor: themeData.pastel,
                      },
                    ]}
                    onPress={() => !isActive && setSelectedDuration(duration)}
                    disabled={isActive}
                  >
                    <Text
                      style={[
                        styles.timeSelectorText,
                        selectedDuration === duration && {
                          color: themeData.border,
                          fontFamily: typography.fontFamily.bold,
                        },
                      ]}
                    >
                      {duration >= 3600 ? `${duration / 3600}hr` : `${duration / 60}m`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.timeSelector,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: themeData.border,
                    borderColor: themeData.border,
                  },
                ]}
                onPress={() => !isActive && setIsCustomModalVisible(true)}
                disabled={isActive}
              >
                <Ionicons name="time-outline" size={16} color={colors.onPrimary} />
                <Text
                  style={[
                    styles.timeSelectorText,
                    { color: colors.onPrimary, fontFamily: typography.fontFamily.bold },
                  ]}
                >
                  Set
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Controls */}
          <View style={[styles.controlsRow, mode === 'stopwatch' && { marginTop: 32 }]}>
            {!isActive || isPaused ? (
              <TouchableOpacity
                style={[
                  styles.playButton,
                  isAnotherTaskActive && { backgroundColor: colors.surfaceVariant },
                ]}
                onPress={handlePlay}
              >
                <Ionicons
                  name="play"
                  size={20}
                  color={isAnotherTaskActive ? colors.onSurfaceVariant : colors.onPrimary}
                />
                <Text
                  style={[
                    styles.playButtonText,
                    isAnotherTaskActive && { color: colors.onSurfaceVariant },
                  ]}
                >
                  {isActive && isPaused ? 'Resume' : 'Start'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.playButton} onPress={handlePause}>
                <Ionicons name="pause" size={20} color={colors.onPrimary} />
                <Text style={styles.playButtonText}>Pause</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.stopButton, !isActive && { opacity: 0.5 }]}
              onPress={handleStop}
              disabled={!isActive}
            >
              <Ionicons name="square-outline" size={20} color={colors.error} />
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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

      {/* Custom Timer Modal */}
      <CustomTimePickerModal
        visible={isCustomModalVisible}
        onClose={() => setIsCustomModalVisible(false)}
        initialTotalSeconds={selectedDuration}
        themeColor={themeData.border}
        onSave={(h, m, s) => {
          setSelectedDuration(h * 3600 + m * 60 + s);
          setIsCustomModalVisible(false);
        }}
      />

      <ConflictModal
        visible={isConflictModalVisible}
        onCancel={() => setIsConflictModalVisible(false)}
        onConfirm={() => {
          const result = stopTimer();
          if (result) {
            setPendingSession({ ...result, taskName: title as string });
            setNoteModalVisible(true);
          }
          startTimer(taskId, title as string);
          setIsConflictModalVisible(false);
        }}
      />

      <NoteModal
        visible={noteModalVisible}
        taskName={pendingSession?.taskName || ''}
        onClose={() => setNoteModalVisible(false)}
        onSubmit={handleSaveSession}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenMargin,
    height: 64,
    backgroundColor: colors.background,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    color: colors.onSurface,
  },
  content: {
    paddingHorizontal: spacing.screenMargin,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 3,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.xl,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    gap: 6,
  },
  segmentButtonActiveBackground: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderRadius: 8,
  },
  segmentText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    color: colors.onSurfaceVariant,
  },
  segmentTextActive: {
    fontFamily: typography.fontFamily.bold,
    color: colors.onSurface,
  },
  timerSection: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
    marginTop: 28, // Push the timer display circle down a bit
  },
  timerCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, // Increased slightly to make the dynamic color more visible
    shadowRadius: 24,
    elevation: 10,
    marginBottom: spacing.xl,
    position: 'relative',
  },
  timerText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 46,
    letterSpacing: -1,
    color: colors.onSurface,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  pillText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xs,
  },
  quickSelectorsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.xl,
  },
  timeSelector: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  timeSelectorText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    color: colors.onSurfaceVariant,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  playButton: {
    flex: 1,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  playButtonText: {
    color: colors.onPrimary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.md,
  },
  stopButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#ffebee',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stopButtonText: {
    color: colors.error,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.md,
  },
  taskSelectionCard: {
    marginTop: 16,
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskSelectionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskDetails: {},
  activeTaskLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
    opacity: 0.8,
  },
  taskTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
  },
  taskSubtitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    opacity: 0.8,
  },
  progressCard: {
    marginTop: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: '#1565c0',
  },
  cardSubtitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    color: '#1565c0',
    opacity: 0.8,
  },
  progressTime: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: '#1565c0',
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1565c0',
    borderRadius: 6,
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
