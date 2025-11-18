CREATE TABLE `profile` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`display_name` text,
	`avatar_url` text,
	`status` text,
	`updated_at` integer
);
