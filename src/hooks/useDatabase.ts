import { desc, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '../db';
import { tasks, timeEntries } from '../db/schema';

// Format YYYY-MM-DD
function getTodayString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function useTasks() {
  // useLiveQuery automatically updates the React UI when the database changes
  const { data, error } = useLiveQuery(
    db.select().from(tasks).orderBy(desc(tasks.isPinned), desc(tasks.updatedAt)),
  );

  return { tasks: data || [], error };
}

export function useTodayTimeEntries() {
  const today = getTodayString();
  const { data, error } = useLiveQuery(
    db.select().from(timeEntries).where(eq(timeEntries.dateString, today)),
  );

  return { entries: data || [], error };
}

// Custom hook to provide mutation functions
export function useDatabaseMutations() {
  const createTask = async (
    title: string,
    icon: string,
    theme: string,
    parentId: number | null = null,
  ) => {
    const now = Math.floor(Date.now() / 1000);
    return await db
      .insert(tasks)
      .values({
        title,
        icon,
        theme,
        parentId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
  };

  const updateTask = async (id: number, title: string, icon: string, theme: string) => {
    const now = Math.floor(Date.now() / 1000);
    return await db
      .update(tasks)
      .set({
        title,
        icon,
        theme,
        updatedAt: now,
      })
      .where(eq(tasks.id, id));
  };

  const togglePinTask = async (id: number, isPinned: boolean) => {
    const now = Math.floor(Date.now() / 1000);
    return await db
      .update(tasks)
      .set({
        isPinned,
        updatedAt: now,
      })
      .where(eq(tasks.id, id));
  };

  const deleteTask = async (id: number) => {
    return await db.delete(tasks).where(eq(tasks.id, id));
  };

  const recordTimeSession = async (
    taskId: number,
    startTime: number,
    endTime: number,
    durationSeconds: number,
    notes: string | null = null,
  ) => {
    let currentStart = startTime;
    const entriesToInsert = [];

    // We calculate a ratio in case the user paused the timer.
    // If the timer wasn't paused, actual duration = wall clock duration (ratio = 1).
    const totalWallClock = endTime - startTime;
    const ratio = totalWallClock > 0 ? durationSeconds / totalWallClock : 1;

    // Loop to handle sessions crossing one or more midnights
    while (currentStart < endTime) {
      const startDate = new Date(currentStart * 1000);
      const dateString = getTodayString(startDate);

      // Calculate midnight of the NEXT day in local time
      const nextMidnight = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + 1,
        0,
        0,
        0,
        0,
      );
      const nextMidnightSeconds = Math.floor(nextMidnight.getTime() / 1000);

      if (endTime <= nextMidnightSeconds) {
        // Session ends on the current day
        const wallClockDuration = endTime - currentStart;
        const actualDuration = Math.round(wallClockDuration * ratio);

        if (actualDuration > 0) {
          entriesToInsert.push({
            taskId,
            dateString,
            startTime: currentStart,
            endTime,
            durationSeconds: actualDuration,
            notes,
          });
        }
        break;
      } else {
        // Session crosses midnight
        const wallClockDuration = nextMidnightSeconds - currentStart;
        const actualDuration = Math.round(wallClockDuration * ratio);

        if (actualDuration > 0) {
          entriesToInsert.push({
            taskId,
            dateString,
            startTime: currentStart,
            endTime: nextMidnightSeconds,
            durationSeconds: actualDuration,
            notes,
          });
        }
        // Move the start time to exactly midnight for the next loop iteration
        currentStart = nextMidnightSeconds;
      }
    }

    if (entriesToInsert.length > 0) {
      return await db.insert(timeEntries).values(entriesToInsert);
    }
  };

  return {
    createTask,
    updateTask,
    togglePinTask,
    deleteTask,
    recordTimeSession,
  };
}
