-- AlterTable
ALTER TABLE "public"."Trivia" DROP COLUMN "sucrate",
DROP COLUMN "type",
ADD COLUMN     "asked" INTEGER NOT NULL,
ADD COLUMN     "correct" INTEGER NOT NULL;
