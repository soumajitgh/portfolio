import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(
    sql`ALTER TABLE \`portfolio_settings\` ADD \`resume_file_id\` integer REFERENCES media(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`portfolio_settings_resume_file_idx\` ON \`portfolio_settings\` (\`resume_file_id\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_portfolio_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_command\` text DEFAULT 'soumajit@portfolio:~$ whoami' NOT NULL,
  	\`hero_headline\` text NOT NULL,
  	\`hero_description\` text NOT NULL,
  	\`primary_action_label\` text NOT NULL,
  	\`primary_action_url\` text NOT NULL,
  	\`secondary_action_label\` text NOT NULL,
  	\`secondary_action_url\` text NOT NULL,
  	\`contact_email\` text DEFAULT 'soumojitghosh02@gmail.com' NOT NULL,
  	\`contact_intro\` text DEFAULT 'Have a backend, infrastructure, or developer tooling problem worth solving? Send the context and I will get back to you.' NOT NULL,
  	\`carousel_rotation_interval\` numeric DEFAULT 7000 NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_portfolio_settings\`("id", "hero_command", "hero_headline", "hero_description", "primary_action_label", "primary_action_url", "secondary_action_label", "secondary_action_url", "contact_email", "contact_intro", "carousel_rotation_interval", "updated_at", "created_at") SELECT "id", "hero_command", "hero_headline", "hero_description", "primary_action_label", "primary_action_url", "secondary_action_label", "secondary_action_url", "contact_email", "contact_intro", "carousel_rotation_interval", "updated_at", "created_at" FROM \`portfolio_settings\`;`,
  )
  await db.run(sql`DROP TABLE \`portfolio_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_portfolio_settings\` RENAME TO \`portfolio_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
