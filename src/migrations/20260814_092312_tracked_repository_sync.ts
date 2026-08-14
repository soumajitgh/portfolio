import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tracked_repositories_sync_status" AS ENUM('pending', 'syncing', 'synced', 'error');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'syncTrackedRepositories');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'syncTrackedRepositories');
  CREATE TABLE "tracked_repositories" (
    "id" serial PRIMARY KEY NOT NULL,
    "repository_url" varchar NOT NULL,
    "github_username" varchar DEFAULT 'soumajitgh' NOT NULL,
    "sync_interval_hours" numeric DEFAULT 2 NOT NULL,
    "enabled" boolean DEFAULT true,
    "refresh_now" boolean DEFAULT false,
    "organization" varchar NOT NULL,
    "repository" varchar NOT NULL,
    "repo_description" varchar,
    "stars" numeric,
    "discovered_pull_requests" numeric DEFAULT 0,
    "sync_status" "enum_tracked_repositories_sync_status" DEFAULT 'pending' NOT NULL,
    "next_sync_at" timestamp(3) with time zone NOT NULL,
    "last_sync_attempt_at" timestamp(3) with time zone,
    "last_synced_at" timestamp(3) with time zone,
    "sync_error" varchar,
    "github_requests_last_sync" numeric DEFAULT 0,
    "github_rate_limit_remaining" numeric,
    "github_rate_limit_reset_at" timestamp(3) with time zone,
    "repo_key" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_jobs_log" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "executed_at" timestamp(3) with time zone NOT NULL,
    "completed_at" timestamp(3) with time zone NOT NULL,
    "task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
    "task_i_d" varchar NOT NULL,
    "input" jsonb,
    "output" jsonb,
    "state" "enum_payload_jobs_log_state" NOT NULL,
    "error" jsonb
  );

  CREATE TABLE "payload_jobs" (
    "id" serial PRIMARY KEY NOT NULL,
    "input" jsonb,
    "completed_at" timestamp(3) with time zone,
    "total_tried" numeric DEFAULT 0,
    "has_error" boolean DEFAULT false,
    "error" jsonb,
    "task_slug" "enum_payload_jobs_task_slug",
    "queue" varchar DEFAULT 'default',
    "wait_until" timestamp(3) with time zone,
    "processing" boolean DEFAULT false,
    "concurrency_key" varchar,
    "meta" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_jobs_stats" (
    "id" serial PRIMARY KEY NOT NULL,
    "stats" jsonb,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  ALTER TABLE "oss_contributions" ADD COLUMN "tracked_repository_id" integer;
  ALTER TABLE "oss_contributions" ADD COLUMN "github_node_id" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tracked_repositories_id" integer;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "tracked_repositories_repository_url_idx" ON "tracked_repositories" USING btree ("repository_url");
  CREATE UNIQUE INDEX "tracked_repositories_repo_key_idx" ON "tracked_repositories" USING btree ("repo_key");
  CREATE INDEX "tracked_repositories_updated_at_idx" ON "tracked_repositories" USING btree ("updated_at");
  CREATE INDEX "tracked_repositories_created_at_idx" ON "tracked_repositories" USING btree ("created_at");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_concurrency_key_idx" ON "payload_jobs" USING btree ("concurrency_key");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  ALTER TABLE "oss_contributions" ADD CONSTRAINT "oss_contributions_tracked_repository_id_tracked_repositories_id_fk" FOREIGN KEY ("tracked_repository_id") REFERENCES "public"."tracked_repositories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tracked_repositories_fk" FOREIGN KEY ("tracked_repositories_id") REFERENCES "public"."tracked_repositories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "oss_contributions_tracked_repository_idx" ON "oss_contributions" USING btree ("tracked_repository_id");
  CREATE UNIQUE INDEX "oss_contributions_github_node_id_idx" ON "oss_contributions" USING btree ("github_node_id");
  CREATE INDEX "payload_locked_documents_rels_tracked_repositories_id_idx" ON "payload_locked_documents_rels" USING btree ("tracked_repositories_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tracked_repositories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_stats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "tracked_repositories" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  ALTER TABLE "oss_contributions" DROP CONSTRAINT "oss_contributions_tracked_repository_id_tracked_repositories_id_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tracked_repositories_fk";

  DROP INDEX "oss_contributions_tracked_repository_idx";
  DROP INDEX "oss_contributions_github_node_id_idx";
  DROP INDEX "payload_locked_documents_rels_tracked_repositories_id_idx";
  ALTER TABLE "oss_contributions" DROP COLUMN "tracked_repository_id";
  ALTER TABLE "oss_contributions" DROP COLUMN "github_node_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tracked_repositories_id";
  DROP TYPE "public"."enum_tracked_repositories_sync_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
