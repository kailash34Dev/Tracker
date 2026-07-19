CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`icon` text NOT NULL,
	`theme` text NOT NULL,
	`parent_id` integer,
	`is_pinned` integer DEFAULT false NOT NULL,
	`daily_goal_seconds` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `time_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer NOT NULL,
	`date_string` text NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`duration_seconds` integer DEFAULT 0 NOT NULL,
	`notes` text,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `task_date_idx` ON `time_entries` (`task_id`,`date_string`);