import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "oss_contributions_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "oss_contributions_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "oss_contributions_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "oss_contributions_delete" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "tracked_repositories_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "tracked_repositories_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "tracked_repositories_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "tracked_repositories_delete" boolean DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "oss_contributions_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "oss_contributions_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "oss_contributions_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "oss_contributions_delete";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "tracked_repositories_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "tracked_repositories_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "tracked_repositories_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "tracked_repositories_delete";`)
}
