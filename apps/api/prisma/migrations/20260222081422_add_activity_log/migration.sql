-- CreateTable
CREATE TABLE "MCPActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "MCPActivityLog_source_idx" ON "MCPActivityLog"("source");

-- CreateIndex
CREATE INDEX "MCPActivityLog_createdAt_idx" ON "MCPActivityLog"("createdAt");
