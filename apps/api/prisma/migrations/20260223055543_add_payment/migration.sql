-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "sepayTxId" INTEGER NOT NULL,
    "gateway" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "transferType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "content" TEXT,
    "referenceCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "rawPayload" TEXT,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_sepayTxId_key" ON "Payment"("sepayTxId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_projectId_idx" ON "Payment"("projectId");

-- CreateIndex
CREATE INDEX "Payment_sepayTxId_idx" ON "Payment"("sepayTxId");
