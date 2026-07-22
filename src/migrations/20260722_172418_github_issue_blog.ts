import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`blog_issue_counter\` (
    \`id\` integer PRIMARY KEY NOT NULL CHECK (\`id\` = 1),
    \`value\` integer NOT NULL
  );`)
  await db.run(sql`INSERT INTO \`blog_issue_counter\` (\`id\`, \`value\`) VALUES (1, 0);`)
  await db.run(sql`CREATE TABLE \`blog_posts_labels\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`blog_posts_labels_order_idx\` ON \`blog_posts_labels\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`blog_posts_labels_parent_id_idx\` ON \`blog_posts_labels\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`blog_posts\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`title\` text,
	\`slug\` text,
	\`issue_number\` numeric,
	\`body\` text,
	\`excerpt\` text,
	\`search_text\` text,
	\`reading_minutes\` numeric DEFAULT 1,
	\`published_at\` text,
	\`seo_title\` text,
	\`seo_description\` text,
	\`seo_image_id\` integer,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`_status\` text DEFAULT 'draft',
	FOREIGN KEY (\`seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`blog_posts_slug_idx\` ON \`blog_posts\` (\`slug\`);`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`blog_posts_issue_number_idx\` ON \`blog_posts\` (\`issue_number\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`blog_posts_search_text_idx\` ON \`blog_posts\` (\`search_text\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`blog_posts_published_at_idx\` ON \`blog_posts\` (\`published_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`blog_posts_seo_seo_image_idx\` ON \`blog_posts\` (\`seo_image_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`blog_posts_updated_at_idx\` ON \`blog_posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_created_at_idx\` ON \`blog_posts\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts__status_idx\` ON \`blog_posts\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_blog_posts_v_version_labels\` (
	\`_order\` integer NOT NULL,
	\`_parent_id\` integer NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`name\` text,
	\`_uuid\` text,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_blog_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_blog_posts_v_version_labels_order_idx\` ON \`_blog_posts_v_version_labels\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_blog_posts_v_version_labels_parent_id_idx\` ON \`_blog_posts_v_version_labels\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_blog_posts_v\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`parent_id\` integer,
	\`version_title\` text,
	\`version_slug\` text,
	\`version_issue_number\` numeric,
	\`version_body\` text,
	\`version_excerpt\` text,
	\`version_search_text\` text,
	\`version_reading_minutes\` numeric DEFAULT 1,
	\`version_published_at\` text,
	\`version_seo_title\` text,
	\`version_seo_description\` text,
	\`version_seo_image_id\` integer,
	\`version_updated_at\` text,
	\`version_created_at\` text,
	\`version__status\` text DEFAULT 'draft',
	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	\`latest\` integer,
	\`autosave\` integer,
	FOREIGN KEY (\`parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (\`version_seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_blog_posts_v_parent_idx\` ON \`_blog_posts_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_blog_posts_v_version_version_slug_idx\` ON \`_blog_posts_v\` (\`version_slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_blog_posts_v_version_version_issue_number_idx\` ON \`_blog_posts_v\` (\`version_issue_number\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_blog_posts_v_version_version_search_text_idx\` ON \`_blog_posts_v\` (\`version_search_text\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_blog_posts_v_version_version_published_at_idx\` ON \`_blog_posts_v\` (\`version_published_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_blog_posts_v_version_seo_version_seo_image_idx\` ON \`_blog_posts_v\` (\`version_seo_image_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_blog_posts_v_version_version_updated_at_idx\` ON \`_blog_posts_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_blog_posts_v_version_version_created_at_idx\` ON \`_blog_posts_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_blog_posts_v_version_version__status_idx\` ON \`_blog_posts_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_blog_posts_v_created_at_idx\` ON \`_blog_posts_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_blog_posts_v_updated_at_idx\` ON \`_blog_posts_v\` (\`updated_at\`);`,
  )
  await db.run(sql`CREATE INDEX \`_blog_posts_v_latest_idx\` ON \`_blog_posts_v\` (\`latest\`);`)
  await db.run(
    sql`CREATE INDEX \`_blog_posts_v_autosave_idx\` ON \`_blog_posts_v\` (\`autosave\`);`,
  )
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_small_url\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_small_width\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_small_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_small_mime_type\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_small_filesize\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_small_filename\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_large_url\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_large_width\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_large_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_large_mime_type\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_large_filesize\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`sizes_large_filename\` text;`)
  await db.run(
    sql`CREATE INDEX \`media_sizes_small_sizes_small_filename_idx\` ON \`media\` (\`sizes_small_filename\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`media_sizes_large_sizes_large_filename_idx\` ON \`media\` (\`sizes_large_filename\`);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`blog_posts_id\` integer REFERENCES blog_posts(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_blog_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`blog_posts_id\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`blog_issue_counter\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_labels\`;`)
  await db.run(sql`DROP TABLE \`blog_posts\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v_version_labels\`;`)
  await db.run(sql`DROP TABLE \`_blog_posts_v\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
	\`id\` integer PRIMARY KEY NOT NULL,
	\`order\` integer,
	\`parent_id\` integer NOT NULL,
	\`path\` text NOT NULL,
	\`users_id\` integer,
	\`media_id\` integer,
	\`projects_id\` integer,
	\`project_stars_id\` integer,
	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (\`project_stars_id\`) REFERENCES \`project_stars\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "projects_id", "project_stars_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "projects_id", "project_stars_id" FROM \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_project_stars_id_idx\` ON \`payload_locked_documents_rels\` (\`project_stars_id\`);`,
  )
  await db.run(sql`DROP INDEX \`media_sizes_small_sizes_small_filename_idx\`;`)
  await db.run(sql`DROP INDEX \`media_sizes_large_sizes_large_filename_idx\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_small_url\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_small_width\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_small_height\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_small_mime_type\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_small_filesize\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_small_filename\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_large_url\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_large_width\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_large_height\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_large_mime_type\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_large_filesize\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`sizes_large_filename\`;`)
}
