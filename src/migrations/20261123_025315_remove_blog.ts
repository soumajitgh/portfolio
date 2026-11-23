import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "payload_locked_documents"
    WHERE "id" IN (
      SELECT "parent_id" FROM "payload_locked_documents_rels"
      WHERE "path" = 'document' AND ("blog_posts_id" IS NOT NULL OR "blog_stars_id" IS NOT NULL)
    );
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN "blog_posts_id",
      DROP COLUMN "blog_stars_id";
    ALTER TABLE "payload_mcp_api_keys"
      DROP COLUMN "blog_posts_find",
      DROP COLUMN "blog_posts_create",
      DROP COLUMN "blog_posts_update",
      DROP COLUMN "blog_posts_delete";

    DROP TABLE "blog_stars";
    DROP TABLE "_blog_posts_v_version_labels";
    DROP TABLE "_blog_posts_v";
    DROP TABLE "blog_posts_labels";
    DROP TABLE "blog_posts";
    DROP TABLE "blog_issue_counter";
    DROP TYPE "public"."enum_blog_posts_status";
    DROP TYPE "public"."enum__blog_posts_v_version_status";
  `)
}

// Restores the schema only. Removed records cannot be recovered by rollback.
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_blog_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blog_posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "blog_posts_labels" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar
  );

  CREATE TABLE "blog_posts" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "slug" varchar,
    "issue_number" numeric,
    "body" jsonb,
    "excerpt" varchar,
    "search_text" varchar,
    "reading_minutes" numeric DEFAULT 1,
    "published_at" timestamp(3) with time zone,
    "featured" boolean DEFAULT false,
    "seo_title" varchar,
    "seo_description" varchar,
    "seo_image_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_blog_posts_status" DEFAULT 'draft'
  );

  CREATE TABLE "_blog_posts_v_version_labels" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_blog_posts_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_slug" varchar,
    "version_issue_number" numeric,
    "version_body" jsonb,
    "version_excerpt" varchar,
    "version_search_text" varchar,
    "version_reading_minutes" numeric DEFAULT 1,
    "version_published_at" timestamp(3) with time zone,
    "version_featured" boolean DEFAULT false,
    "version_seo_title" varchar,
    "version_seo_description" varchar,
    "version_seo_image_id" integer,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__blog_posts_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "blog_stars" (
    "id" serial PRIMARY KEY NOT NULL,
    "blog_post_id" integer NOT NULL,
    "visitor_hash" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "blog_posts_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "blog_posts_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "blog_posts_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "blog_posts_delete" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "blog_posts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "blog_stars_id" integer;
  ALTER TABLE "blog_posts_labels" ADD CONSTRAINT "blog_posts_labels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_posts_v_version_labels" ADD CONSTRAINT "_blog_posts_v_version_labels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_blog_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_parent_id_blog_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_stars" ADD CONSTRAINT "blog_stars_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "blog_posts_labels_order_idx" ON "blog_posts_labels" USING btree ("_order");
  CREATE INDEX "blog_posts_labels_parent_id_idx" ON "blog_posts_labels" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");
  CREATE UNIQUE INDEX "blog_posts_issue_number_idx" ON "blog_posts" USING btree ("issue_number");
  CREATE INDEX "blog_posts_search_text_idx" ON "blog_posts" USING btree ("search_text");
  CREATE INDEX "blog_posts_published_at_idx" ON "blog_posts" USING btree ("published_at");
  CREATE INDEX "blog_posts_seo_seo_image_idx" ON "blog_posts" USING btree ("seo_image_id");
  CREATE INDEX "blog_posts_updated_at_idx" ON "blog_posts" USING btree ("updated_at");
  CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at");
  CREATE INDEX "blog_posts__status_idx" ON "blog_posts" USING btree ("_status");
  CREATE INDEX "_blog_posts_v_version_labels_order_idx" ON "_blog_posts_v_version_labels" USING btree ("_order");
  CREATE INDEX "_blog_posts_v_version_labels_parent_id_idx" ON "_blog_posts_v_version_labels" USING btree ("_parent_id");
  CREATE INDEX "_blog_posts_v_parent_idx" ON "_blog_posts_v" USING btree ("parent_id");
  CREATE INDEX "_blog_posts_v_version_version_slug_idx" ON "_blog_posts_v" USING btree ("version_slug");
  CREATE INDEX "_blog_posts_v_version_version_issue_number_idx" ON "_blog_posts_v" USING btree ("version_issue_number");
  CREATE INDEX "_blog_posts_v_version_version_search_text_idx" ON "_blog_posts_v" USING btree ("version_search_text");
  CREATE INDEX "_blog_posts_v_version_version_published_at_idx" ON "_blog_posts_v" USING btree ("version_published_at");
  CREATE INDEX "_blog_posts_v_version_seo_version_seo_image_idx" ON "_blog_posts_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_blog_posts_v_version_version_updated_at_idx" ON "_blog_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_blog_posts_v_version_version_created_at_idx" ON "_blog_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_blog_posts_v_version_version__status_idx" ON "_blog_posts_v" USING btree ("version__status");
  CREATE INDEX "_blog_posts_v_created_at_idx" ON "_blog_posts_v" USING btree ("created_at");
  CREATE INDEX "_blog_posts_v_updated_at_idx" ON "_blog_posts_v" USING btree ("updated_at");
  CREATE INDEX "_blog_posts_v_latest_idx" ON "_blog_posts_v" USING btree ("latest");
  CREATE INDEX "_blog_posts_v_autosave_idx" ON "_blog_posts_v" USING btree ("autosave");
  CREATE INDEX "blog_stars_blog_post_idx" ON "blog_stars" USING btree ("blog_post_id");
  CREATE INDEX "blog_stars_updated_at_idx" ON "blog_stars" USING btree ("updated_at");
  CREATE INDEX "blog_stars_created_at_idx" ON "blog_stars" USING btree ("created_at");
  CREATE UNIQUE INDEX "blogPost_visitorHash_idx" ON "blog_stars" USING btree ("blog_post_id","visitor_hash");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_stars_fk" FOREIGN KEY ("blog_stars_id") REFERENCES "public"."blog_stars"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_blog_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_posts_id");
  CREATE INDEX "payload_locked_documents_rels_blog_stars_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_stars_id");

  CREATE TABLE "blog_issue_counter" (
    "id" integer PRIMARY KEY CHECK ("id" = 1),
    "value" integer NOT NULL DEFAULT 0
  );
  INSERT INTO "blog_issue_counter" ("id", "value") VALUES (1, 0);
  `)
}
