import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '../db';
import { tasks, timeEntries } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { useState, useEffect } from 'react';

// Format YYYY-MM-DD
export function getTodayString() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function useTasks() {
  // useLiveQuery automatically updates the React UI when the database changes
  const { data, error } = useLiveQuery(
    db.select().from(tasks).orderBy(desc(tasks.isPinned), desc(tasks.updatedAt))
  );

  return { tasks: data || [], error };
}

export function useTodayTimeEntries() {
  const today = getTodayString();
  const { data, error } = useLiveQuery(
    db.select().from(timeEntries).where(eq(timeEntries.dateString, today))
  );

  return { entries: data || [], error };
}

// Custom hook to provide mutation functions
export function useDatabaseMutations() {
  
  const createTask = async (title: string, icon: string, theme: string, parentId: number | null = null) => {
    const now = Math.floor(Date.now() / 1000);
    return await db.insert(tasks).values({
      title,
      icon,
      theme,
      parentId,
      createdAt: now,
      updatedAt: now,
    }).returning();
  };

  const updateTask = async (id: number, title: string, icon: string, theme: string) => {
    const now = Math.floor(Date.now() / 1000);
    return await db.update(tasks).set({
      title,
      icon,
      theme,
      updatedAt: now,
    }).where(eq(tasks.id, id));
  };

  const togglePinTask = async (id: number, isPinned: boolean) => {
    const now = Math.floor(Date.now() / 1000);
    return await db.update(tasks).set({
      isPinned,
      updatedAt: now,
    }).where(eq(tasks.id, id));
  };

  const deleteTask = async (id: number) => {
    return await db.delete(tasks).where(eq(tasks.id, id));
  };

  const recordTimeSession = async (taskId: number, startTime: number, endTime: number, durationSeconds: number, notes: string | null = null) => {
    const dateString = getTodayString();
    return await db.insert(timeEntries).values({
      taskId,
      dateString,
      startTime,
      endTime,
      durationSeconds,
      notes,
    });
  };

  return {
    createTask,
    updateTask,
    togglePinTask,
    deleteTask,
    recordTimeSession,
  };
}
