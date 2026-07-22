// React imports
import { memo, useCallback, useMemo, useState } from 'react';
// React-native imports
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Expo imports
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
// Component imports
import ActiveTimerBar from '../../src/components/ActiveTimerBar';
import ConflictModal from '../../src/components/ConflictModal';
import CreateTaskButton from '../../src/components/CreateTaskButton';
import DeleteConfirmModal from '../../src/components/DeleteConfirmModal';
import Header from '../../src/components/Header';
import NoteModal from '../../src/components/NoteModal';
import SearchBar from '../../src/components/SearchBar';
import TaskCard from '../../src/components/TaskCard';
import TaskModal from '../../src/components/TaskModal';
// Theme imports
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
// Store imports
import { useTimerStore } from '../../src/store/useTimerStore';
import { useToastStore } from '../../src/store/useToastStore';
// Utils imports
import { getIconForCategory } from '../../src/utils/iconMapper';
// Hooks imports
import { useDatabaseMutations, useTasks, useTodayTimeEntries } from '../../src/hooks/useDatabase';

export default function TasksScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isConflictModalVisible, setIsConflictModalVisible] = useState(false);
  const [conflictTask, setConflictTask] = useState<{ id: number; title: string } | null>(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [pendingSession, setPendingSession] = useState<any>(null);

  const showToast = useToastStore((state) => state.showToast);

  const router = useRouter();

  const activeTaskId = useTimerStore((state) => state.activeTaskId);
  const activeTaskName = useTimerStore((state) => state.activeTaskName);
  const startTimer = useTimerStore((state) => state.startTimer);
  const stopTimer = useTimerStore((state) => state.stopTimer);
  const togglePause = useTimerStore((state) => state.togglePause);

  // Database Hooks
  const { tasks } = useTasks();
  const { entries } = useTodayTimeEntries();
  const { createTask, updateTask, togglePinTask, deleteTask, recordTimeSession } =
    useDatabaseMutations();

  // Compute hours per task for today
  const taskHoursMap = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        if (!acc[entry.taskId]) acc[entry.taskId] = 0;
        acc[entry.taskId] += entry.durationSeconds;
        return acc;
      },
      {} as Record<number, number>,
    );
  }, [entries]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return tasks.filter((c) => c.title.toLowerCase().includes(query));
  }, [tasks, searchQuery]);

  const existingTaskNames = useMemo(() => tasks.map((t) => t.title), [tasks]);

  const closeTaskModal = useCallback(() => {
    setModalVisible(false);
    setSelectedTask(null);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalVisible(false);
    setSelectedTask(null);
  }, []);

  const closeConflictModal = useCallback(() => {
    setIsConflictModalVisible(false);
  }, []);

  const closeNoteModal = useCallback(() => {
    setNoteModalVisible(false);
  }, []);

  const handleToggleTimer = useCallback(
    async (categoryId: number, categoryTitle: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const currentActiveId = useTimerStore.getState().activeTaskId;

      if (currentActiveId === categoryId) {
        // Stopping current timer
        const result = stopTimer();
        if (result) {
          setPendingSession({ ...result, taskName: result.taskName || 'Unknown Task' });
          setNoteModalVisible(true);
        }
      } else {
        if (currentActiveId) {
          setConflictTask({ id: categoryId, title: categoryTitle });
          setIsConflictModalVisible(true);
          return;
        }
        // Start new timer
        startTimer(categoryId, categoryTitle);
      }
    },
    [stopTimer, startTimer],
  );

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

  const confirmStartConflictTask = async () => {
    if (activeTaskId) {
      const result = stopTimer();
      if (result) {
        setPendingSession({ ...result, taskName: result.taskName || 'Unknown Task' });
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
    const availableThemes = [
      'blue',
      'purple',
      'orange',
      'green',
      'pink',
      'teal',
      'red',
      'indigo',
      'mint',
      'amber',
    ];

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

  const handlePinTask = useCallback(
    async (task: any) => {
      await togglePinTask(task.id, !task.isPinned);
    },
    [togglePinTask],
  );

  const handleEditTask = useCallback((task: any) => {
    // Convert to string for the modal form mapping
    setSelectedTask({ ...task, id: String(task.id) });
    setModalVisible(true);
  }, []);

  const handleCardPress = useCallback(
    (task: any, hoursForCard: number) => {
      router.push({
        pathname: '/task/[id]',
        params: {
          id: task.id,
          title: task.title,
          hours: hoursForCard,
          icon: task.icon,
          theme: task.theme,
        },
      });
    },
    [router],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerWrapper}>
        <Header title="Task" iconName="checkmark-circle-outline" />
      </View>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        <View style={{ marginTop: 10 }}>
          <CreateTaskButton
            onPress={() => {
              setSelectedTask(null);
              setModalVisible(true);
            }}
          />
        </View>

        {activeTaskId !== null && activeTaskName !== null && (
          <ActiveTimerBar
            taskName={activeTaskName}
            onTogglePause={togglePause}
            onStop={() => handleToggleTimer(activeTaskId, activeTaskName)}
            onTimerComplete={(result) => {
              setPendingSession({ ...result, taskName: result.taskName || 'Unknown Task' });
              setNoteModalVisible(true);
            }}
            onPress={() => {
              const activeTask = tasks.find((c) => c.id === activeTaskId);
              if (activeTask) {
                const secondsToday = taskHoursMap[activeTask.id] || 0;
                const hoursForCard =
                  (secondsToday + useTimerStore.getState().elapsedSeconds) / 3600;
                router.push({
                  pathname: '/task/[id]',
                  params: {
                    id: activeTask.id,
                    title: activeTask.title,
                    hours: hoursForCard,
                    icon: activeTask.icon,
                    theme: activeTask.theme,
                  },
                });
              }
            }}
          />
        )}

        <View style={styles.listContainer}>
          {(() => {
            if (tasks.length === 0) {
              return (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="list-outline" size={48} color={colors.onSurfaceVariant} />
                  <Text style={styles.emptyStateText}>
                    No tasks yet. Create one to get started!
                  </Text>
                </View>
              );
            }

            if (filteredTasks.length === 0 && searchQuery.length > 0) {
              return (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="search-outline" size={48} color={colors.onSurfaceVariant} />
                  <Text style={styles.emptyStateText}>
                    No tasks found for &quot;{searchQuery}&quot;
                  </Text>
                </View>
              );
            }

            return filteredTasks.map((task) => {
              const baseSeconds = taskHoursMap[task.id] || 0;

              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  baseSeconds={baseSeconds}
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

      <TaskModal
        visible={modalVisible}
        onClose={closeTaskModal}
        onSubmit={handleCreateCategory}
        initialData={selectedTask}
        existingTaskNames={existingTaskNames}
      />

      <DeleteConfirmModal
        visible={deleteModalVisible}
        taskName={selectedTask?.title}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTask}
      />

      <ConflictModal
        visible={isConflictModalVisible}
        onCancel={closeConflictModal}
        onConfirm={confirmStartConflictTask}
      />

      <NoteModal
        visible={noteModalVisible}
        taskName={pendingSession?.taskName || ''}
        onClose={closeNoteModal}
        onSubmit={handleSaveSession}
      />
    </SafeAreaView>
  );
}

const TaskItem = memo(
  ({
    task,
    baseSeconds,
    onCardPress,
    onToggleTimer,
    onTogglePause,
    onEditTask,
    onPinTask,
    onDeleteTask,
  }: any) => {
    const isActive = useTimerStore((state) => state.activeTaskId === task.id);
    const activeSeconds = useTimerStore((state) =>
      state.activeTaskId === task.id ? state.elapsedSeconds : 0,
    );
    const isAnotherTaskActive = useTimerStore(
      (state) => state.activeTaskId !== null && state.activeTaskId !== task.id,
    );
    const isPaused = useTimerStore((state) => state.activeTaskId === task.id && state.isPaused);

    const hoursForCard = (baseSeconds + activeSeconds) / 3600;

    return (
      <TaskCard
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
  },
);
TaskItem.displayName = 'TaskItem';

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
    height: 85,
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
});
