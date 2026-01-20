-- Migration 2: Add new fields to project table
-- 2026-01-20

ALTER TABLE "project" 
ADD COLUMN "projectName" TEXT,
ADD COLUMN "isCompleted" BOOLEAN DEFAULT FALSE,
ADD COLUMN "projectStatus" TEXT;

-- Update existing records if necessary
-- UPDATE "project" SET "isCompleted" = FALSE, "projectStatus" = 'ACTIVE' WHERE "isCompleted" IS NULL;
