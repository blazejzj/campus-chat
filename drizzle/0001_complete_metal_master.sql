ALTER TABLE `rooms` ADD `slug` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `rooms_slug_unique` ON `rooms` (`slug`);