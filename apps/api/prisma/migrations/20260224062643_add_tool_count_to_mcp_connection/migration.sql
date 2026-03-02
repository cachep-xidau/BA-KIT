-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MCPConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "toolCount" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MCPConnection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MCPConnection" ("config", "createdAt", "id", "name", "projectId", "status", "type", "updatedAt") SELECT "config", "createdAt", "id", "name", "projectId", "status", "type", "updatedAt" FROM "MCPConnection";
DROP TABLE "MCPConnection";
ALTER TABLE "new_MCPConnection" RENAME TO "MCPConnection";
CREATE INDEX "MCPConnection_projectId_idx" ON "MCPConnection"("projectId");
CREATE UNIQUE INDEX "MCPConnection_projectId_type_name_key" ON "MCPConnection"("projectId", "type", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
