import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "projects" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "projects" ADD COLUMN "seo_image_id" integer;
  ALTER TABLE "_projects_v" ADD COLUMN "version_seo_title" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_seo_description" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_seo_image_id" integer;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "projects_seo_seo_image_idx" ON "projects" USING btree ("seo_image_id");
  CREATE INDEX "_projects_v_version_seo_version_seo_image_idx" ON "_projects_v" USING btree ("version_seo_image_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP CONSTRAINT "projects_seo_image_id_media_id_fk";

  ALTER TABLE "_projects_v" DROP CONSTRAINT "_projects_v_version_seo_image_id_media_id_fk";

  DROP INDEX "projects_seo_seo_image_idx";
  DROP INDEX "_projects_v_version_seo_version_seo_image_idx";
  ALTER TABLE "projects" DROP COLUMN "seo_title";
  ALTER TABLE "projects" DROP COLUMN "seo_description";
  ALTER TABLE "projects" DROP COLUMN "seo_image_id";
  ALTER TABLE "_projects_v" DROP COLUMN "version_seo_title";
  ALTER TABLE "_projects_v" DROP COLUMN "version_seo_description";
  ALTER TABLE "_projects_v" DROP COLUMN "version_seo_image_id";`)
}
