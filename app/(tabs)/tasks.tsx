import { View, StyleSheet, ScrollView, Text, Modal, TouchableWithoutFeedback, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import Header from '../../src/components/Header';
import SearchBar from '../../src/components/SearchBar';
import CreateCategoryButton from '../../src/components/CreateCategoryButton';
import CategoryCard from '../../src/components/CategoryCard';
import CategoryModal from '../../src/components/CategoryModal';
import DeleteConfirmModal from '../../src/components/DeleteConfirmModal';
import NoteModal from '../../src/components/NoteModal';
import ActiveTimerBar from '../../src/components/ActiveTimerBar';
import { getIconForCategory } from '../../src/utils/iconMapper';
import { colors } from '../../src/theme/colors';
import { useTimer } from '../../src/context/TimerContext';
import { spacing, radius } from '../../src/theme/spacing';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../src/theme/typography';
import { useTasks, useTodayTimeEntries, useDatabaseMutations } from '../../src/hooks/useDatabase';

export default function TasksScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isConflictModalVisible, setIsConflictModalVisible] = useState(false);
  const [conflictTask, setConflictTask] = useState<{ id: number; title: string } | null>(null);
  
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [pendingSession, setPendingSession] = useState<any>(null);
  
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastAnim = useRef(new Animated.Value(-100)).current;

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 75, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastAnim, { toValue: -100, duration: 300, useNativeDriver: true })
    ]).start(() => setToastVisible(false));
  };

  const router = useRouter();

  const { activeTaskId, activeTaskName, elapsedSeconds, isPaused, startTimer, stopTimer, togglePause } = useTimer();
  
  // Database Hooks
  const { tasks } = useTasks();
  const { entries } = useTodayTimeEntries();
  const { createTask, updateTask, togglePinTask, deleteTask, recordTimeSession } = useDatabaseMutations();

  // Compute hours per task for today
  const taskHoursMap = entries.reduce((acc, entry) => {
    if (!acc[entry.taskId]) acc[entry.taskId] = 0;
    acc[entry.taskId] += entry.durationSeconds;
    return acc;
  }, {} as Record<number, number>);

  const handleToggleTimer = useCallback(async (categoryId: number, categoryTitle: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (activeTaskId === categoryId) {
      // Stopping current timer
      const result = stopTimer();
      if (result) {
        setPendingSession({ ...result, taskName: categoryTitle });
        setNoteModalVisible(true);
      }
    } else {
      if (activeTaskId) {
        setConflictTask({ id: categoryId, title: categoryTitle });
        setIsConflictModalVisible(true);
        return;
      }
      // Start new timer
      startTimer(categoryId, categoryTitle);
    }
  }, [activeTaskId, stopTimer, startTimer]);

  const handleSaveSession = async (note: string | null) => {
    if (pendingSession) {
      await recordTimeSession(
        pendingSession.taskId,
        pendingSession.startTime,
        pendingSession.endTime,
        pendingSession.seconds,
        note
      );
      setPendingSession(null);
      showToast('Session saved successfully!');
    }
    setNoteModalVisible(false);
  };

  const confirmStartConflictTask = async () => {
    if (activeTaskId) {
      const result = stopTimer();
      if (result) {
        const title = tasks.find(t => t.id === activeTaskId)?.title || '';
        setPendingSession({ ...result, taskName: title });
        setNoteModalVisible(true);
      }
    }
    if (conflictTask) {
      startTimer(conflictTask.id, conflictTask.title);
      setConflictTask(null);
    }
    setIsConflictModalVisible(false);
  };

  const handleCreateCategory = async (name: string, themeId: string, id?: string) => {
    // Handle random theme selection
    let finalTheme = themeId;
    const availableThemes = ['blue', 'purple', 'orange', 'green', 'pink', 'teal', 'red', 'indigo', 'mint', 'amber'];
    
    if (themeId === 'random') {
      finalTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
    }

    const validTheme = availableThemes.includes(finalTheme) ? finalTheme : 'blue';
    const newIcon = getIconForCategory(name);
    
    if (id) {
      await updateTask(Number(id), name, newIcon, validTheme);
      showToast('Task updated successfully!');
    } else {
      await createTask(name, newIcon, validTheme, null);
      showToast('Task created successfully!');
    }
  };

  const requestDeleteTask = useCallback((task: any) => {
    setSelectedTask(task);
    setDeleteModalVisible(true);
  }, []);

  const confirmDeleteTask = async () => {
    if (selectedTask) {
      if (activeTaskId === selectedTask.id) {
        const result = stopTimer();
        if (result) {
          await recordTimeSession(result.taskId, result.startTime, result.endTime, result.seconds);
        }
      }
      await deleteTask(selectedTask.id);
      setDeleteModalVisible(false);
      setSelectedTask(null);
      showToast('Task deleted successfully!');
    }
  };

  const handlePinTask = useCallback(async (task: any) => {
    await togglePinTask(task.id, !task.isPinned);
  }, [togglePinTask]);

  const handleEditTask = useCallback((task: any) => {
    // Convert to string for the modal form mapping
    setSelectedTask({ ...task, id: String(task.id) });
    setModalVisible(true);
  }, []);

  const handleCardPress = useCallback((task: any, hoursForCard: number) => {
    router.push({ pathname: '/task/[id]', params: { id: task.id, title: task.title, hours: hoursForCard, icon: task.icon, theme: task.theme } });
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerWrapper}>
        <Header />
      </View>
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <CreateCategoryButton onPress={() => { setSelectedTask(null); setModalVisible(true); }} />

        {activeTaskId !== null && activeTaskName !== null && (
          <ActiveTimerBar 
            taskName={activeTaskName}
            elapsedSeconds={elapsedSeconds}
            isPaused={isPaused}
            onTogglePause={togglePause}
            onStop={() => handleToggleTimer(activeTaskId, activeTaskName)}
            onPress={() => {
              const activeTask = tasks.find(c => c.id === activeTaskId);
              if (activeTask) {
                const secondsToday = taskHoursMap[activeTask.id] || 0;
                const hoursForCard = (secondsToday + elapsedSeconds) / 3600;
                router.push({ pathname: '/task/[id]', params: { id: activeTask.id, title: activeTask.title, hours: hoursForCard, icon: activeTask.icon, theme: activeTask.theme } });
              }
            }}
          />
        )}

        <View style={styles.listContainer}>
          {(() => {
            const filteredTasks = tasks.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
            
            if (tasks.length === 0) {
              return (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="list-outline" size={48} color={colors.onSurfaceVariant} />
                  <Text style={styles.emptyStateText}>No tasks yet. Create one to get started!</Text>
                </View>
              );
            }

            if (filteredTasks.length === 0 && searchQuery.length > 0) {
              return (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="search-outline" size={48} color={colors.onSurfaceVariant} />
                  <Text style={styles.emptyStateText}>No tasks found for "{searchQuery}"</Text>
                </View>
              );
            }

            return filteredTasks.map(task => {
              const secondsToday = taskHoursMap[task.id] || 0;
              const activeSeconds = activeTaskId === task.id ? elapsedSeconds : 0;
              const hoursForCard = (secondsToday + activeSeconds) / 3600;

              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  hoursForCard={hoursForCard}
                  isActive={activeTaskId === task.id}
                  isAnotherTaskActive={activeTaskId !== null && activeTaskId !== task.id}
                  isPaused={activeTaskId === task.id && isPaused}
                  onCardPress={handleCardPress}
                  onToggleTimer={handleToggleTimer}
                  onTogglePause={togglePause}
                  onEditTask={handleEditTask}
                  onPinTask={handlePinTask}
                  onDeleteTask={requestDeleteTask}
                />
              );
            });
          })()}
            {/* Add extra padding at the bottom so cards aren't hidden by the absolute tab bar */}
            <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      <CategoryModal 
        visible={modalVisible} 
        onClose={() => { setModalVisible(false); setSelectedTask(null); }}
        onSubmit={handleCreateCategory}
        initialData={selectedTask}
        existingTaskNames={tasks.map(t => t.title)}
      />

      <DeleteConfirmModal
        visible={deleteModalVisible}
        taskName={selectedTask?.title}
        onClose={() => { setDeleteModalVisible(false); setSelectedTask(null); }}
        onConfirm={confirmDeleteTask}
      />

      <Modal visible={isConflictModalVisible} transparent animationType="fade" onRequestClose={() => setIsConflictModalVisible(false)} statusBarTranslucent={true}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsConflictModalVisible(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.conflictModalContainer}>
            <View style={styles.conflictIconContainer}>
              <Ionicons name="warning" size={24} color={colors.error} />
            </View>
            <Text style={styles.conflictTitle}>Task in Progress</Text>
            <Text style={styles.conflictSubtitle}>
              Another task is currently active. Would you like to stop it and start this one?
            </Text>
            <View style={styles.conflictButtonContainer}>
              <TouchableOpacity style={styles.conflictCancelButton} onPress={() => setIsConflictModalVisible(false)} activeOpacity={0.7}>
                <Text style={styles.conflictCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.conflictConfirmButton} 
                onPress={confirmStartConflictTask} 
                activeOpacity={0.7}
              >
                <Text style={styles.conflictConfirmText}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
          <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <NoteModal
        visible={noteModalVisible}
        taskName={pendingSession?.taskName || ''}
        onClose={() => setNoteModalVisible(false)}
        onSubmit={handleSaveSession}
      />
    </SafeAreaView>
  );
}

const TaskItem = memo(({ 
  task, 
  hoursForCard, 
  isActive, 
  isAnotherTaskActive, 
  isPaused, 
  onCardPress, 
  onToggleTimer, 
  onTogglePause, 
  onEditTask, 
  onPinTask, 
  onDeleteTask 
}: any) => {
  return (
    <CategoryCard
      title={task.title}
      hours={hoursForCard}
      iconName={task.icon as any}
      theme={task.theme as any}
      isActive={isActive}
      isAnotherTaskActive={isAnotherTaskActive}
      isPaused={isPaused}
      isPinned={task.isPinned}
      onPress={() => onCardPress(task, hoursForCard)}
      onPlay={() => onToggleTimer(task.id, task.title)}
      onTogglePause={onTogglePause}
      onEdit={() => onEditTask(task)}
      onPin={() => onPinTask(task)}
      onDelete={() => onDeleteTask(task)}
    />
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrapper: {
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 3,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  container: {
    padding: spacing.screenMargin,
    paddingTop: 0,
  },
  listContainer: {
    marginTop: spacing.xs,
  },
  bottomPadding: {
    height: 85, // Make room for tab bar
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateText: {
    marginTop: spacing.md,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  conflictModalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 24,
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
  conflictIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  conflictTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  conflictSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  conflictButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  conflictCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    marginRight: 6,
  },
  conflictCancelText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  conflictConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.error,
    alignItems: 'center',
    marginLeft: 6,
  },
  conflictConfirmText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.sm,
    color: '#ffffff',
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 1000,
  },
  toastText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
    color: '#ffffff',
  }
});
