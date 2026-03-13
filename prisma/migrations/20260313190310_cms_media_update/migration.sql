-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "alt" TEXT,
ADD COLUMN     "blurhash" TEXT,
ADD COLUMN     "caption" TEXT,
ADD COLUMN     "dominantColor" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'DRAFT';
