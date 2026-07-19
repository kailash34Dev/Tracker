import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// 1. TASKS / CATEGORIES TABLE
// ---------------------------------------------------------------------------
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  
  // Basic Info
  title: text('title').notNull(),
  icon: text('icon').notNull(),
  theme: text('theme').notNull(),
  
  // Hierarchy (For Sub-tasks)
  parentId: integer('parent_id').references(() => tasks.id),
  
  // UI States
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false).notNull(),
  
  // Goals (seconds per day)
  dailyGoalSeconds: integer('daily_goal_seconds'),
  
  // Timestamps (Stored as Unix timestamps)
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// ---------------------------------------------------------------------------
// 2. TIME ENTRIES TABLE (Sessions)
// ---------------------------------------------------------------------------
export const timeEntries = sqliteTable('time_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  
  // Foreign Key to the Task
  taskId: integer('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  
  // Format: "YYYY-MM-DD"
  dateString: text('date_string').notNull(),
  
  // Session details
  startTime: integer('start_time').notNull(),
  endTime: integer('end_time'),
  durationSeconds: integer('duration_seconds').notNull().default(0),
  
  notes: text('notes'),

}, (table) => {
  return {
    taskDateIdx: index('task_date_idx').on(table.taskId, table.dateString),
  };
});

// ---------------------------------------------------------------------------
// 3. RELATIONS
// ---------------------------------------------------------------------------
export const tasksRelations = relations(tasks, ({ one, many }) => ({
  parent: one(tasks, {
    fields: [tasks.parentId],
    references: [tasks.id],
    relationName: 'subTasks',
  }),
  subTasks: many(tasks, { relationName: 'subTasks' }),
  timeEntries: many(timeEntries),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  task: one(tasks, {
    fields: [timeEntries.taskId],
    references: [tasks.id],
  }),
}));
