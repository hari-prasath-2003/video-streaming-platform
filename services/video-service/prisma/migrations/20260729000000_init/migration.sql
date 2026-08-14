-- CreateEnum
CREATE TYPE "VideoVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "channel_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "thumbnail_url" TEXT,
    "video_url" TEXT NOT NULL,
    "duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "visibility" "VideoVisibility" NOT NULL DEFAULT 'PUBLIC',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_likes" (
    "video_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "liked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_likes_pkey" PRIMARY KEY ("video_id","user_id")
);

-- CreateIndex
CREATE INDEX "videos_channel_id_idx" ON "videos"("channel_id");

-- CreateIndex
CREATE INDEX "videos_uploaded_at_idx" ON "videos"("uploaded_at");

-- CreateIndex
CREATE INDEX "videos_visibility_idx" ON "videos"("visibility");

-- CreateIndex
CREATE INDEX "video_likes_user_id_idx" ON "video_likes"("user_id");

-- AddForeignKey
ALTER TABLE "video_likes" ADD CONSTRAINT "video_likes_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
