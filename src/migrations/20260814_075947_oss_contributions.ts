import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_oss_contributions_status" AS ENUM('open', 'closed', 'merged');
  CREATE TYPE "public"."enum_oss_contributions_github_sync_status" AS ENUM('synced', 'unavailable');
  CREATE TABLE "oss_contributions_tags" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "slug" varchar NOT NULL
  );

  CREATE TABLE "oss_contributions" (
    "id" serial PRIMARY KEY NOT NULL,
    "pr_url" varchar NOT NULL,
    "allow_different_author" boolean DEFAULT false,
    "refresh_from_git_hub" boolean DEFAULT false,
    "portfolio_summary" varchar,
    "featured" boolean DEFAULT false,
    "hidden" boolean DEFAULT false,
    "display_order" numeric DEFAULT 100,
    "title" varchar NOT NULL,
    "pr_number" numeric NOT NULL,
    "author" varchar NOT NULL,
    "status" "enum_oss_contributions_status" NOT NULL,
    "pr_created_at" timestamp(3) with time zone NOT NULL,
    "merged_at" timestamp(3) with time zone,
    "additions" numeric NOT NULL,
    "deletions" numeric NOT NULL,
    "changed_files" numeric NOT NULL,
    "pr_description" varchar,
    "organization" varchar NOT NULL,
    "repository" varchar NOT NULL,
    "repo_url" varchar NOT NULL,
    "repo_description" varchar,
    "stars" numeric NOT NULL,
    "github_sync_status" "enum_oss_contributions_github_sync_status" NOT NULL,
    "github_synced_at" timestamp(3) with time zone NOT NULL,
    "github_sync_error" varchar,
    "pr_key" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "oss_contributions_id" integer;
  ALTER TABLE "oss_contributions_tags" ADD CONSTRAINT "oss_contributions_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."oss_contributions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "oss_contributions_tags_order_idx" ON "oss_contributions_tags" USING btree ("_order");
  CREATE INDEX "oss_contributions_tags_parent_id_idx" ON "oss_contributions_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "oss_contributions_pr_url_idx" ON "oss_contributions" USING btree ("pr_url");
  CREATE UNIQUE INDEX "oss_contributions_pr_key_idx" ON "oss_contributions" USING btree ("pr_key");
  CREATE INDEX "oss_contributions_updated_at_idx" ON "oss_contributions" USING btree ("updated_at");
  CREATE INDEX "oss_contributions_created_at_idx" ON "oss_contributions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_oss_contributions_fk" FOREIGN KEY ("oss_contributions_id") REFERENCES "public"."oss_contributions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_oss_contributions_id_idx" ON "payload_locked_documents_rels" USING btree ("oss_contributions_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "oss_contributions_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "oss_contributions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "oss_contributions_tags" CASCADE;
  DROP TABLE "oss_contributions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_oss_contributions_fk";

  DROP INDEX "payload_locked_documents_rels_oss_contributions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "oss_contributions_id";
  DROP TYPE "public"."enum_oss_contributions_status";
  DROP TYPE "public"."enum_oss_contributions_github_sync_status";`)
}
