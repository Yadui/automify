/*
  Warnings:

  - A unique constraint covering the columns `[userId,type]` on the table `Connections` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Notion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX IF EXISTS "Connections_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "Connections_userId_type_key" ON "Connections"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Notion_userId_key" ON "Notion"("userId");
