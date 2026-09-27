import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_issue_trackers_author_filter" AS ENUM('member', 'collaborator', 'contributor', 'all');
  CREATE TYPE "public"."enum_issue_trackers_sync_status" AS ENUM('pending', 'syncing', 'synced', 'error');
  CREATE TYPE "public"."enum_tracked_issues_status" AS ENUM('new', 'saved', 'ignored');
  CREATE TYPE "public"."enum_tracked_issues_github_state" AS ENUM('open', 'closed');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'syncIssueTrackers';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'syncIssueTrackers';
  CREATE TABLE "issue_trackers" (
    "id" serial PRIMARY KEY NOT NULL,
    "repository_url" varchar NOT NULL,
    "author_filter" "enum_issue_trackers_author_filter" DEFAULT 'all' NOT NULL,
    "sync_interval_hours" numeric DEFAULT 6 NOT NULL,
    "enabled" boolean DEFAULT true,
    "refresh_now" boolean DEFAULT false,
    "organization" varchar NOT NULL,
    "repository" varchar NOT NULL,
    "tracking_started_at" timestamp(3) with time zone NOT NULL,
    "discovered_issues" numeric DEFAULT 0,
    "sync_status" "enum_issue_trackers_sync_status" DEFAULT 'pending' NOT NULL,
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

  CREATE TABLE "tracked_issues" (
    "id" serial PRIMARY KEY NOT NULL,
    "issue_tracker_id" integer NOT NULL,
    "status" "enum_tracked_issues_status" DEFAULT 'new' NOT NULL,
    "github_state" "enum_tracked_issues_github_state" NOT NULL,
    "github_state_reason" varchar,
    "notes" varchar,
    "title" varchar NOT NULL,
    "body" varchar,
    "organization" varchar NOT NULL,
    "repository" varchar NOT NULL,
    "issue_number" numeric NOT NULL,
    "author" varchar NOT NULL,
    "author_association" varchar NOT NULL,
    "comment_count" numeric NOT NULL,
    "labels" jsonb,
    "assignees" jsonb,
    "issue_url" varchar NOT NULL,
    "github_created_at" timestamp(3) with time zone NOT NULL,
    "github_updated_at" timestamp(3) with time zone NOT NULL,
    "closed_at" timestamp(3) with time zone,
    "github_node_id" varchar NOT NULL,
    "issue_key" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "issue_trackers_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tracked_issues_id" integer;
  ALTER TABLE "tracked_issues" ADD CONSTRAINT "tracked_issues_issue_tracker_id_issue_trackers_id_fk" FOREIGN KEY ("issue_tracker_id") REFERENCES "public"."issue_trackers"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "issue_trackers_repository_url_idx" ON "issue_trackers" USING btree ("repository_url");
  CREATE UNIQUE INDEX "issue_trackers_repo_key_idx" ON "issue_trackers" USING btree ("repo_key");
  CREATE INDEX "issue_trackers_updated_at_idx" ON "issue_trackers" USING btree ("updated_at");
  CREATE INDEX "issue_trackers_created_at_idx" ON "issue_trackers" USING btree ("created_at");
  CREATE INDEX "tracked_issues_issue_tracker_idx" ON "tracked_issues" USING btree ("issue_tracker_id");
  CREATE UNIQUE INDEX "tracked_issues_github_node_id_idx" ON "tracked_issues" USING btree ("github_node_id");
  CREATE UNIQUE INDEX "tracked_issues_issue_key_idx" ON "tracked_issues" USING btree ("issue_key");
  CREATE INDEX "tracked_issues_updated_at_idx" ON "tracked_issues" USING btree ("updated_at");
  CREATE INDEX "tracked_issues_created_at_idx" ON "tracked_issues" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_issue_trackers_fk" FOREIGN KEY ("issue_trackers_id") REFERENCES "public"."issue_trackers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tracked_issues_fk" FOREIGN KEY ("tracked_issues_id") REFERENCES "public"."tracked_issues"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_issue_trackers_id_idx" ON "payload_locked_documents_rels" USING btree ("issue_trackers_id");
  CREATE INDEX "payload_locked_documents_rels_tracked_issues_id_idx" ON "payload_locked_documents_rels" USING btree ("tracked_issues_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_issue_trackers_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tracked_issues_fk";
  ALTER TABLE "issue_trackers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tracked_issues" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "tracked_issues" CASCADE;
  DROP TABLE "issue_trackers" CASCADE;

  DELETE FROM "payload_jobs_log" WHERE "task_slug" = 'syncIssueTrackers';
  DELETE FROM "payload_jobs" WHERE "task_slug" = 'syncIssueTrackers';
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'syncTrackedRepositories');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'syncTrackedRepositories');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "payload_locked_documents_rels_issue_trackers_id_idx";
  DROP INDEX "payload_locked_documents_rels_tracked_issues_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "issue_trackers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tracked_issues_id";
  DROP TYPE "public"."enum_issue_trackers_author_filter";
  DROP TYPE "public"."enum_issue_trackers_sync_status";
  DROP TYPE "public"."enum_tracked_issues_status";
  DROP TYPE "public"."enum_tracked_issues_github_state";`)
}
