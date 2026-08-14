-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- Existing rows in "video_likes" are all likes, so the table is reshaped in
-- place rather than rebuilt — no reaction data is lost.

-- AlterTable
ALTER TABLE "video_likes" RENAME TO "video_reactions";

ALTER TABLE "video_reactions" RENAME COLUMN "liked_at" TO "reacted_at";

ALTER TABLE "video_reactions" ADD COLUMN "type" "ReactionType" NOT NULL DEFAULT 'LIKE';

-- Rename the inherited constraints/indexes to match the new table name so
-- Prisma does not see drift.
ALTER TABLE "video_reactions" RENAME CONSTRAINT "video_likes_pkey" TO "video_reactions_pkey";

ALTER TABLE "video_reactions" RENAME CONSTRAINT "video_likes_video_id_fkey" TO "video_reactions_video_id_fkey";

ALTER INDEX "video_likes_user_id_idx" RENAME TO "video_reactions_user_id_idx";

-- CreateIndex
CREATE INDEX "video_reactions_video_id_type_idx" ON "video_reactions"("video_id", "type");
