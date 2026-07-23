import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_links_type" AS ENUM('github', 'demo', 'documentation', 'package', 'article', 'custom');
  CREATE TYPE "public"."enum_projects_category" AS ENUM('infrastructure', 'developer-tools', 'application', 'open-source', 'experiment', 'other');
  CREATE TYPE "public"."enum_projects_lifecycle_status" AS ENUM('active', 'completed', 'maintained', 'archived', 'experimental');
  CREATE TYPE "public"."enum_projects_accent" AS ENUM('blue', 'cyan', 'green', 'yellow', 'purple');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_links_type" AS ENUM('github', 'demo', 'documentation', 'package', 'article', 'custom');
  CREATE TYPE "public"."enum__projects_v_version_category" AS ENUM('infrastructure', 'developer-tools', 'application', 'open-source', 'experiment', 'other');
  CREATE TYPE "public"."enum__projects_v_version_accent" AS ENUM('blue', 'cyan', 'green', 'yellow', 'purple');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_blog_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blog_posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_portfolio_settings_skills_category" AS ENUM('languages', 'backend-apis', 'data-storage', 'infrastructure', 'observability', 'tools');
  CREATE TABLE "users_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "email" varchar NOT NULL,
    "reset_password_token" varchar,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" varchar,
    "hash" varchar,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone
  );

  CREATE TABLE "media" (
    "id" serial PRIMARY KEY NOT NULL,
    "alt" varchar NOT NULL,
    "caption" varchar,
    "prefix" varchar DEFAULT 'media',
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "url" varchar,
    "thumbnail_u_r_l" varchar,
    "filename" varchar,
    "mime_type" varchar,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric,
    "sizes_small_url" varchar,
    "sizes_small_width" numeric,
    "sizes_small_height" numeric,
    "sizes_small_mime_type" varchar,
    "sizes_small_filesize" numeric,
    "sizes_small_filename" varchar,
    "sizes_large_url" varchar,
    "sizes_large_width" numeric,
    "sizes_large_height" numeric,
    "sizes_large_mime_type" varchar,
    "sizes_large_filesize" numeric,
    "sizes_large_filename" varchar
  );

  CREATE TABLE "projects_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar
  );

  CREATE TABLE "projects_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "type" "enum_projects_links_type"
  );

  CREATE TABLE "projects_topics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar,
    "slug" varchar
  );

  CREATE TABLE "projects" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "slug" varchar,
    "short_description" varchar,
    "category" "enum_projects_category",
    "overview" jsonb,
    "cover_image_id" integer,
    "status" "enum_projects_lifecycle_status",
    "accent" "enum_projects_accent" DEFAULT 'blue',
    "featured" boolean DEFAULT false,
    "pinned" boolean DEFAULT false,
    "display_order" numeric DEFAULT 100,
    "project_year" numeric,
    "published_at" timestamp(3) with time zone,
    "repository_owner" varchar,
    "repository_name" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_projects_status" DEFAULT 'draft'
  );

  CREATE TABLE "_projects_v_version_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_projects_v_version_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "url" varchar,
    "type" "enum__projects_v_version_links_type",
    "_uuid" varchar
  );

  CREATE TABLE "_projects_v_version_topics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "slug" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_projects_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_slug" varchar,
    "version_short_description" varchar,
    "version_category" "enum__projects_v_version_category",
    "version_overview" jsonb,
    "version_cover_image_id" integer,
    "version_status" "enum_projects_lifecycle_status",
    "version_accent" "enum__projects_v_version_accent" DEFAULT 'blue',
    "version_featured" boolean DEFAULT false,
    "version_pinned" boolean DEFAULT false,
    "version_display_order" numeric DEFAULT 100,
    "version_project_year" numeric,
    "version_published_at" timestamp(3) with time zone,
    "version_repository_owner" varchar,
    "version_repository_name" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__projects_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

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

  CREATE TABLE "project_stars" (
    "id" serial PRIMARY KEY NOT NULL,
    "project_id" integer NOT NULL,
    "visitor_hash" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "blog_stars" (
    "id" serial PRIMARY KEY NOT NULL,
    "blog_post_id" integer NOT NULL,
    "visitor_hash" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_mcp_api_keys" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "label" varchar,
    "description" varchar,
    "blog_posts_find" boolean DEFAULT false,
    "projects_find" boolean DEFAULT false,
    "portfolio_settings_find" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "enable_a_p_i_key" boolean,
    "api_key" varchar,
    "api_key_index" varchar
  );

  CREATE TABLE "payload_kv" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar NOT NULL,
    "data" jsonb NOT NULL
  );

  CREATE TABLE "payload_locked_documents" (
    "id" serial PRIMARY KEY NOT NULL,
    "global_slug" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer,
    "media_id" integer,
    "projects_id" integer,
    "blog_posts_id" integer,
    "project_stars_id" integer,
    "blog_stars_id" integer,
    "payload_mcp_api_keys_id" integer
  );

  CREATE TABLE "payload_preferences" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar,
    "value" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_preferences_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer,
    "payload_mcp_api_keys_id" integer
  );

  CREATE TABLE "payload_migrations" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "batch" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "portfolio_settings_contact_socials" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "url" varchar NOT NULL
  );

  CREATE TABLE "portfolio_settings_interests" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "description" varchar
  );

  CREATE TABLE "portfolio_settings_skills_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "proficiency" varchar,
    "icon" varchar,
    "link" varchar
  );

  CREATE TABLE "portfolio_settings_skills" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "category" "enum_portfolio_settings_skills_category" NOT NULL
  );

  CREATE TABLE "portfolio_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "hero_command" varchar DEFAULT 'soumajit@portfolio:~$ whoami' NOT NULL,
    "hero_headline" varchar DEFAULT 'Your request
  has been handled.' NOT NULL,
    "hero_description" varchar DEFAULT 'Designing fast, reliable backend systems with clean boundaries and production-grade attention to detail.' NOT NULL,
    "primary_action_label" varchar NOT NULL,
    "primary_action_url" varchar NOT NULL,
    "secondary_action_label" varchar NOT NULL,
    "secondary_action_url" varchar NOT NULL,
    "resume_file_id" integer,
    "contact_email" varchar DEFAULT 'soumojitghosh02@gmail.com' NOT NULL,
    "contact_intro" varchar DEFAULT 'Have a backend, infrastructure, or developer tooling problem worth solving? Send the context and I will get back to you.' NOT NULL,
    "carousel_rotation_interval" numeric DEFAULT 7000 NOT NULL,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "portfolio_settings_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "projects_id" integer
  );

  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_links" ADD CONSTRAINT "projects_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_topics" ADD CONSTRAINT "projects_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_links" ADD CONSTRAINT "_projects_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_topics" ADD CONSTRAINT "_projects_v_version_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_posts_labels" ADD CONSTRAINT "blog_posts_labels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_posts_v_version_labels" ADD CONSTRAINT "_blog_posts_v_version_labels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_blog_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_parent_id_blog_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_stars" ADD CONSTRAINT "project_stars_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_stars" ADD CONSTRAINT "blog_stars_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_mcp_api_keys" ADD CONSTRAINT "payload_mcp_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_stars_fk" FOREIGN KEY ("project_stars_id") REFERENCES "public"."project_stars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_stars_fk" FOREIGN KEY ("blog_stars_id") REFERENCES "public"."blog_stars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_settings_contact_socials" ADD CONSTRAINT "portfolio_settings_contact_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portfolio_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_settings_interests" ADD CONSTRAINT "portfolio_settings_interests_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portfolio_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_settings_skills_items" ADD CONSTRAINT "portfolio_settings_skills_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portfolio_settings_skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_settings_skills" ADD CONSTRAINT "portfolio_settings_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portfolio_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_settings" ADD CONSTRAINT "portfolio_settings_resume_file_id_media_id_fk" FOREIGN KEY ("resume_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "portfolio_settings_rels" ADD CONSTRAINT "portfolio_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."portfolio_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_settings_rels" ADD CONSTRAINT "portfolio_settings_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order");
  CREATE INDEX "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
  CREATE INDEX "projects_gallery_media_idx" ON "projects_gallery" USING btree ("media_id");
  CREATE INDEX "projects_links_order_idx" ON "projects_links" USING btree ("_order");
  CREATE INDEX "projects_links_parent_id_idx" ON "projects_links" USING btree ("_parent_id");
  CREATE INDEX "projects_topics_order_idx" ON "projects_topics" USING btree ("_order");
  CREATE INDEX "projects_topics_parent_id_idx" ON "projects_topics" USING btree ("_parent_id");
  CREATE INDEX "projects_topics_slug_idx" ON "projects_topics" USING btree ("slug");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_cover_image_idx" ON "projects" USING btree ("cover_image_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "_projects_v_version_gallery_order_idx" ON "_projects_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_projects_v_version_gallery_parent_id_idx" ON "_projects_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_gallery_media_idx" ON "_projects_v_version_gallery" USING btree ("media_id");
  CREATE INDEX "_projects_v_version_links_order_idx" ON "_projects_v_version_links" USING btree ("_order");
  CREATE INDEX "_projects_v_version_links_parent_id_idx" ON "_projects_v_version_links" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_topics_order_idx" ON "_projects_v_version_topics" USING btree ("_order");
  CREATE INDEX "_projects_v_version_topics_parent_id_idx" ON "_projects_v_version_topics" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_topics_slug_idx" ON "_projects_v_version_topics" USING btree ("slug");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_cover_image_idx" ON "_projects_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");
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
  CREATE INDEX "project_stars_project_idx" ON "project_stars" USING btree ("project_id");
  CREATE INDEX "project_stars_updated_at_idx" ON "project_stars" USING btree ("updated_at");
  CREATE INDEX "project_stars_created_at_idx" ON "project_stars" USING btree ("created_at");
  CREATE UNIQUE INDEX "project_visitorHash_idx" ON "project_stars" USING btree ("project_id","visitor_hash");
  CREATE INDEX "blog_stars_blog_post_idx" ON "blog_stars" USING btree ("blog_post_id");
  CREATE INDEX "blog_stars_updated_at_idx" ON "blog_stars" USING btree ("updated_at");
  CREATE INDEX "blog_stars_created_at_idx" ON "blog_stars" USING btree ("created_at");
  CREATE UNIQUE INDEX "blogPost_visitorHash_idx" ON "blog_stars" USING btree ("blog_post_id","visitor_hash");
  CREATE INDEX "payload_mcp_api_keys_user_idx" ON "payload_mcp_api_keys" USING btree ("user_id");
  CREATE INDEX "payload_mcp_api_keys_updated_at_idx" ON "payload_mcp_api_keys" USING btree ("updated_at");
  CREATE INDEX "payload_mcp_api_keys_created_at_idx" ON "payload_mcp_api_keys" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_blog_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_posts_id");
  CREATE INDEX "payload_locked_documents_rels_project_stars_id_idx" ON "payload_locked_documents_rels" USING btree ("project_stars_id");
  CREATE INDEX "payload_locked_documents_rels_blog_stars_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_stars_id");
  CREATE INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx" ON "payload_preferences_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "portfolio_settings_contact_socials_order_idx" ON "portfolio_settings_contact_socials" USING btree ("_order");
  CREATE INDEX "portfolio_settings_contact_socials_parent_id_idx" ON "portfolio_settings_contact_socials" USING btree ("_parent_id");
  CREATE INDEX "portfolio_settings_interests_order_idx" ON "portfolio_settings_interests" USING btree ("_order");
  CREATE INDEX "portfolio_settings_interests_parent_id_idx" ON "portfolio_settings_interests" USING btree ("_parent_id");
  CREATE INDEX "portfolio_settings_skills_items_order_idx" ON "portfolio_settings_skills_items" USING btree ("_order");
  CREATE INDEX "portfolio_settings_skills_items_parent_id_idx" ON "portfolio_settings_skills_items" USING btree ("_parent_id");
  CREATE INDEX "portfolio_settings_skills_order_idx" ON "portfolio_settings_skills" USING btree ("_order");
  CREATE INDEX "portfolio_settings_skills_parent_id_idx" ON "portfolio_settings_skills" USING btree ("_parent_id");
  CREATE INDEX "portfolio_settings_resume_file_idx" ON "portfolio_settings" USING btree ("resume_file_id");
  CREATE INDEX "portfolio_settings_rels_order_idx" ON "portfolio_settings_rels" USING btree ("order");
  CREATE INDEX "portfolio_settings_rels_parent_idx" ON "portfolio_settings_rels" USING btree ("parent_id");
  CREATE INDEX "portfolio_settings_rels_path_idx" ON "portfolio_settings_rels" USING btree ("path");
  CREATE INDEX "portfolio_settings_rels_projects_id_idx" ON "portfolio_settings_rels" USING btree ("projects_id");`)

  await db.execute(sql`
    CREATE TABLE "blog_issue_counter" (
      "id" integer PRIMARY KEY CHECK ("id" = 1),
      "value" integer NOT NULL DEFAULT 0
    );

    INSERT INTO "blog_issue_counter" ("id", "value")
    VALUES (1, 0)
    ON CONFLICT ("id") DO NOTHING;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "projects_gallery" CASCADE;
  DROP TABLE "projects_links" CASCADE;
  DROP TABLE "projects_topics" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "_projects_v_version_gallery" CASCADE;
  DROP TABLE "_projects_v_version_links" CASCADE;
  DROP TABLE "_projects_v_version_topics" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "blog_posts_labels" CASCADE;
  DROP TABLE "blog_posts" CASCADE;
  DROP TABLE "_blog_posts_v_version_labels" CASCADE;
  DROP TABLE "_blog_posts_v" CASCADE;
  DROP TABLE "project_stars" CASCADE;
  DROP TABLE "blog_stars" CASCADE;
  DROP TABLE "payload_mcp_api_keys" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "portfolio_settings_contact_socials" CASCADE;
  DROP TABLE "portfolio_settings_interests" CASCADE;
  DROP TABLE "portfolio_settings_skills_items" CASCADE;
  DROP TABLE "portfolio_settings_skills" CASCADE;
  DROP TABLE "portfolio_settings" CASCADE;
  DROP TABLE "portfolio_settings_rels" CASCADE;
  DROP TYPE "public"."enum_projects_links_type";
  DROP TYPE "public"."enum_projects_category";
  DROP TYPE "public"."enum_projects_lifecycle_status";
  DROP TYPE "public"."enum_projects_accent";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_links_type";
  DROP TYPE "public"."enum__projects_v_version_category";
  DROP TYPE "public"."enum__projects_v_version_accent";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum_blog_posts_status";
  DROP TYPE "public"."enum__blog_posts_v_version_status";
  DROP TYPE "public"."enum_portfolio_settings_skills_category";`)

  await db.execute(sql`DROP TABLE IF EXISTS "blog_issue_counter";`)
}
