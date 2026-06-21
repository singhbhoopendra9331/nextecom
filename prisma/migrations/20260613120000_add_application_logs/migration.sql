-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR');

-- CreateTable
CREATE TABLE "application_logs" (
  "id" TEXT NOT NULL,
  "level" "LogLevel" NOT NULL,
  "message" TEXT NOT NULL,
  "context" JSONB,
  "stack" TEXT,
  "source" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "application_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "application_logs_level_idx" ON "application_logs"("level");

-- CreateIndex
CREATE INDEX "application_logs_createdAt_idx" ON "application_logs"("createdAt");

-- CreateIndex
CREATE INDEX "application_logs_source_idx" ON "application_logs"("source");
