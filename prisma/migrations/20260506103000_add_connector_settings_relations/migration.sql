-- Add generic connector settings and relation metadata to support connector-specific
-- configuration without adding bespoke tables for each app pairing.
ALTER TABLE "Connections"
ADD COLUMN "settings" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN "relations" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN "nodeId" TEXT,
ADD COLUMN "workflowId" TEXT,
ADD COLUMN "defaultAction" TEXT;

CREATE INDEX "Connections_workflowId_idx" ON "Connections"("workflowId");
CREATE INDEX "Connections_nodeId_idx" ON "Connections"("nodeId");
