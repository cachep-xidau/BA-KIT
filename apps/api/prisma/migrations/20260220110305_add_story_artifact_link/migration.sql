-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Artifact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'current',
    "sourceHash" TEXT,
    "functionId" TEXT,
    "projectId" TEXT,
    "epicId" TEXT,
    "storyId" TEXT,
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Artifact_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "Function" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Artifact_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Artifact_epicId_fkey" FOREIGN KEY ("epicId") REFERENCES "Artifact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Artifact_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Artifact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Artifact" ("archivedAt", "content", "createdAt", "epicId", "functionId", "id", "projectId", "sourceHash", "status", "title", "type", "version") SELECT "archivedAt", "content", "createdAt", "epicId", "functionId", "id", "projectId", "sourceHash", "status", "title", "type", "version" FROM "Artifact";
DROP TABLE "Artifact";
ALTER TABLE "new_Artifact" RENAME TO "Artifact";
CREATE INDEX "Artifact_functionId_idx" ON "Artifact"("functionId");
CREATE INDEX "Artifact_projectId_idx" ON "Artifact"("projectId");
CREATE INDEX "Artifact_epicId_idx" ON "Artifact"("epicId");
CREATE INDEX "Artifact_storyId_idx" ON "Artifact"("storyId");
CREATE INDEX "Artifact_type_idx" ON "Artifact"("type");
CREATE INDEX "Artifact_status_idx" ON "Artifact"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
