-- CreateTable
CREATE TABLE "UserPlan" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "tier" TEXT NOT NULL DEFAULT 'free',
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "creditsRemaining" INTEGER NOT NULL DEFAULT 30,
    "creditsAddon" INTEGER NOT NULL DEFAULT 0,
    "chatUsedToday" INTEGER NOT NULL DEFAULT 0,
    "batchTrialUsed" BOOLEAN NOT NULL DEFAULT false,
    "renewalDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
