import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`blog_issue_counter\` (
    \`id\` integer PRIMARY KEY NOT NULL CHECK (\`id\` = 1),
    \`value\` integer NOT NULL
  );`)

  await db.run(sql`INSERT OR IGNORE INTO \`blog_issue_counter\` (\`id\`, \`value\`)
    VALUES (1, 0);`)

  // Repair environments that created posts before the counter table was restored.
  // Normal issue allocation never derives the next value from MAX(issue_number).
  await db.run(sql`UPDATE \`blog_issue_counter\`
    SET \`value\` = MAX(
      \`value\`,
      COALESCE((SELECT MAX(\`issue_number\`) FROM \`blog_posts\`), 0)
    )
    WHERE \`id\` = 1;`)
}

// The foundational blog migration owns this shared table. Rolling back the
// repair must not remove it or invalidate existing issue-number allocation.
export async function down(_args: MigrateDownArgs): Promise<void> {}
