# SRS (Software Requirements Specification)

## Template

```
# SRS: [Feature Name]

**Description:** [Brief description of the feature]
**Actor:** [User role - e.g., AIA User, Admin]
**Jira ID:** [SUZ-XXXXX or leave blank]
**Figma:** [Figma design link]
**Screen Design:** [Link to screen description document]

## Pre-condition
- [Condition 1 that must be true before process starts]
- [Condition 2]

## Process
1. [Step 1 - User action or system action]
2. [Step 2]
3. [Step 3]

## Post-condition
- [Result 1 after process completes]
- [Result 2]

## Business Requirement
- BR-001: [User action] - [What user achieves]
- BR-002: [User action] - [What user achieves]
- BR-003: [User action] - [What user achieves]

## System Requirement

### Database Schema
- Table: [table_name]
- New field: [field_name] - [data_type] - [description]

### SQL Scripts

**Reference ID Format:** `[Ref: SRS-MODULE-FEATURE-Q#]` for queries, `[Ref: SRS-MODULE-FEATURE-V#]` for validations

**Example:**
```sql
-- [Ref: SRS-TOD-010-Q1] Load widget preferences
SELECT widget_id, is_visible, display_order
FROM widget_preferences
WHERE user_id = @user_id
ORDER BY display_order ASC;

-- [Ref: SRS-TOD-010-Q2] Update widget visibility
UPDATE widget_preferences
SET is_visible = @is_visible, updated_at = NOW()
WHERE user_id = @user_id AND widget_id = @widget_id;
```

### Validation Logic

**Reference ID Format:** `[Ref: SRS-MODULE-FEATURE-V#]`

**Example:**
```javascript
// [Ref: SRS-TOD-010-V1] Minimum 1 visible widget constraint
if (visibleWidgets.filter(w => w.isVisible).length === 1 && !newState) {
  throw new ValidationError("Minimum 1 widget required");
}
```

### API Updates

**Reference ID Format:** `[Ref: SRS-MODULE-FEATURE-API-##]`

**Example:**
- `[Ref: SRS-TOD-010-API-01]` POST /api/v1/widgets/preferences - Update widget visibility
- `[Ref: SRS-TOD-010-API-02]` GET /api/v1/widgets/preferences - Load user preferences
```

## Example

```
# SRS: Claim SGT

**Description:** User claims matured stake (principal + reward) to Web3 Wallet
**Actor:** AIA User
**Jira ID:** SUZ-17494
**Figma:** https://www.figma.com/design/xxx
**Screen Design:** screen-description.md

## Pre-condition
- Stake has reached end_date (maturity)
- Stake status is redeemed (status = 4)

## Process
1. User selects "Claim" from staking list or detail
2. System displays Claim Request screen
3. User taps "Continue"
4. System sends verification code via email
5. User enters 6-digit code
6. System validates and processes on-chain transaction
7. System updates status to claimed

## Post-condition
- Stake status changed to claimed (status = 7)
- SGT transferred to user's Web3 Wallet
- Email notification sent

## Business Requirement
- BR-001: View claimable stakes - User sees matured stakes with Claim button
- BR-002: Review claim details - User sees principal, reward, total before confirming
- BR-003: Verify with OTP - User enters code for security
- BR-004: Track progress - User sees transaction status
- BR-005: Receive confirmation - User gets email with tx hash

## System Requirement

### Database Schema
- Table: stake_record
- Field update: status (4 → 6 → 7)
- Field update: claim_tx_hash, claimed_datetime

### SQL Scripts
-- Start claim
UPDATE stake_record
SET status = 6, update_datetime = NOW()
WHERE id = @stake_id AND status = 4;

-- Claim success
UPDATE stake_record
SET status = 7, claim_tx_hash = @tx_hash, claimed_datetime = NOW()
WHERE id = @stake_id AND status = 6;

### API Updates
- POST /api/v1/staking/{id}/claim - Execute claim with OTP verification
- GET /api/v1/staking/{id}/claim/status - Get claim transaction status
```
