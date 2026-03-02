/*
  Warnings:

  - Added the required column `name` to the `MCPConnection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MCPConnection` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MCPConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MCPConnection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MCPConnection" ("config", "createdAt", "id", "projectId", "status", "type") SELECT "config", "createdAt", "id", "projectId", "status", "type" FROM "MCPConnection";
DROP TABLE "MCPConnection";
ALTER TABLE "new_MCPConnection" RENAME TO "MCPConnection";
CREATE INDEX "MCPConnection_projectId_idx" ON "MCPConnection"("projectId");
CREATE UNIQUE INDEX "MCPConnection_projectId_type_name_key" ON "MCPConnection"("projectId", "type", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
