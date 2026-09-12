-- AlterTable
ALTER TABLE "Trivia" ADD COLUMN     "difficulty" TEXT NOT NULL,
ADD COLUMN     "sucrate" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "comment" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "messageContent" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "postSlug" TEXT NOT NULL,
    "repliesToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_id_slug_key" ON "post"("id", "slug");

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_postId_postSlug_fkey" FOREIGN KEY ("postId", "postSlug") REFERENCES "post"("id", "slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_repliesToId_fkey" FOREIGN KEY ("repliesToId") REFERENCES "comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

