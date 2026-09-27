-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('pending', 'replied');

-- AlterTable
ALTER TABLE "public"."Request" ADD COLUMN     "status" "public"."RequestStatus" NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "public"."posttemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "posttemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."posttemplate" ADD CONSTRAINT "posttemplate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

