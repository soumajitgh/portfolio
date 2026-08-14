import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "blog_posts_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "blog_posts_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "blog_posts_delete" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "projects_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "projects_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "projects_delete" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "portfolio_settings_update" boolean DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "blog_posts_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "blog_posts_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "blog_posts_delete";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "projects_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "projects_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "projects_delete";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "portfolio_settings_update";`)
}
