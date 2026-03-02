# Phase 1: Database Schema

## Context
- Parent: [plan.md](./plan.md)
- Target: `apps/api/prisma/schema.prisma`

## Overview
- **Priority:** P0 (foundation)
- **Status:** completed
- **Description:** Add Payment model for tracking SePay transactions

## Key Insights
- SePay uses integer `id` as unique transaction identifier
- Must prevent duplicate webhooks via unique constraint
- Store raw webhook payload for debugging/audit

## Requirements

### Functional
- Store SePay transaction data
- Track payment status (pending → completed/failed)
- Link to Project for future paid features

### Non-Functional
- Unique constraint on `sepayTxId` for deduplication
- Index on `status` for query performance

## Architecture

```prisma
model Payment {
  id            String   @id @default(cuid())
  projectId     String?
  project       Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)

  // SePay transaction data
  sepayTxId     Int      @unique          // SePay webhook "id" field
  gateway       String                     // Bank name (Vietcombank, etc.)
  accountNumber String                     // Bank account
  transferType  String                     // "in" or "out"
  amount        Decimal  @db.Decimal(15, 2)
  content       String?   @db.Text        // Transfer content
  referenceCode String?                   // Bank reference code

  // Internal tracking
  status        String   @default("completed") // completed, failed, duplicate
  rawPayload    String?  @db.Text         // Full JSON for audit
  processedAt   DateTime @default(now())
  createdAt     DateTime @default(now())

  @@index([status])
  @@index([projectId])
  @@index([sepayTxId])
}
```

## Related Code Files

### Modify
- `apps/api/prisma/schema.prisma` - Add Payment model, update Project relation

### Run After
```bash
cd apps/api && pnpm prisma migrate dev --name add_payment
```

## Implementation Steps

1. [x] Add Payment model to schema.prisma
2. [x] Add `payments` relation to Project model
3. [x] Run Prisma migration
4. [x] Verify migration in SQLite

## Success Criteria
- [x] Migration runs without errors
- [x] Payment table created with correct schema
- [x] Unique constraint on `sepayTxId` works

## Security Considerations
- `rawPayload` may contain sensitive data - consider encryption for production
- For MVP: store as-is (internal system)

## Next Steps
→ Phase 2: Environment Config
