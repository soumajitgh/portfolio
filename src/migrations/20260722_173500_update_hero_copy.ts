import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`UPDATE \`portfolio_settings\`
    SET
      \`hero_headline\` = 'Your request
has been handled.',
      \`hero_description\` = 'Designing fast, reliable backend systems with clean boundaries and production-grade attention to detail.'
    WHERE \`id\` = 1;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`UPDATE \`portfolio_settings\`
    SET
      \`hero_headline\` = 'I build reliable backend systems.',
      \`hero_description\` = 'I design APIs, distributed systems, and developer infrastructure with an emphasis on reliability, clarity, and long-term maintainability.'
    WHERE \`id\` = 1;`)
}
