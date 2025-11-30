CREATE TABLE `friendships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id_a` integer NOT NULL,
	`user_id_b` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id_a`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id_b`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
