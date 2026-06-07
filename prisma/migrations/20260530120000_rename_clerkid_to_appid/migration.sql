-- Rename the external auth identifier column from the legacy "clerkId" to "appId".
-- Postgres automatically retargets foreign keys that reference this column.
ALTER TABLE "User" RENAME COLUMN "clerkId" TO "appId";

-- Keep the unique index name consistent with the new column name.
ALTER INDEX "User_clerkId_key" RENAME TO "User_appId_key";
