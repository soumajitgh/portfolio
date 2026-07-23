import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "portfolio_settings" DROP COLUMN "primary_action_label";
  ALTER TABLE "portfolio_settings" DROP COLUMN "primary_action_url";
  ALTER TABLE "portfolio_settings" DROP COLUMN "secondary_action_label";
  ALTER TABLE "portfolio_settings" DROP COLUMN "secondary_action_url";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "portfolio_settings" ADD COLUMN "primary_action_label" varchar NOT NULL DEFAULT './view-projects';
  ALTER TABLE "portfolio_settings" ADD COLUMN "primary_action_url" varchar NOT NULL DEFAULT '/projects';
  ALTER TABLE "portfolio_settings" ADD COLUMN "secondary_action_label" varchar NOT NULL DEFAULT './explore-stack';
  ALTER TABLE "portfolio_settings" ADD COLUMN "secondary_action_url" varchar NOT NULL DEFAULT '#portfolio';
  ALTER TABLE "portfolio_settings" ALTER COLUMN "primary_action_label" DROP DEFAULT;
  ALTER TABLE "portfolio_settings" ALTER COLUMN "primary_action_url" DROP DEFAULT;
  ALTER TABLE "portfolio_settings" ALTER COLUMN "secondary_action_label" DROP DEFAULT;
  ALTER TABLE "portfolio_settings" ALTER COLUMN "secondary_action_url" DROP DEFAULT;`)
}
