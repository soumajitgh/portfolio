import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`portfolio_settings_contact_socials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`portfolio_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`portfolio_settings_contact_socials_order_idx\` ON \`portfolio_settings_contact_socials\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`portfolio_settings_contact_socials_parent_id_idx\` ON \`portfolio_settings_contact_socials\` (\`_parent_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`media\` ADD \`prefix\` text DEFAULT 'media';`)
  await db.run(
    sql`ALTER TABLE \`portfolio_settings\` ADD \`contact_email\` text DEFAULT 'soumojitghosh02@gmail.com' NOT NULL;`,
  )
  await db.run(
    sql`ALTER TABLE \`portfolio_settings\` ADD \`contact_intro\` text DEFAULT 'Have a backend, infrastructure, or developer tooling problem worth solving? Send the context and I will get back to you.' NOT NULL;`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`portfolio_settings_contact_socials\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`prefix\`;`)
  await db.run(sql`ALTER TABLE \`portfolio_settings\` DROP COLUMN \`contact_email\`;`)
  await db.run(sql`ALTER TABLE \`portfolio_settings\` DROP COLUMN \`contact_intro\`;`)
}
