# User Story

Write lean user stories. Create separate files for each user story.

> **UI text capture** belongs in Screen Description, not User Story. See [`screen-description.md`](screen-description.md).

## File Naming Convention

`US-[MODULE]-[NUMBER]-[name].md`
- `US-ONB-001-onboarding-flow.md`
- `US-STORE-001-purchase-gacha.md`
- `US-WALK-001-start-session.md`

## Template

```markdown
# US-XXX-NNN: [Short descriptive title]

## References

| Type | Link |
|------|------|
| Figma | [URL] |
| Function List | [FL-XXX-NNN] |
| SRS | [SRS-XXX-NNN] |
| Related US | [US-XXX-NNN] |

## User Story

**As a** [role]
**I want** [action]
**So that** [benefit]

## Pre-conditions

- [condition 1]
- [condition 2]

## Entry Point

[Screen Name] > [Section] > [Action]

## Acceptance Criteria

### AC-1: [AC Name]

[Context], user [action], system [expected result]

### AC-2: [AC Name]

[Context], user [action], system [expected result]

## Business Rules

- **BR-001:** [Rule description]
- **BR-002:** [Rule description]

## Exception Handling

- **[Exception scenario]:** [System response]
- **[Exception scenario]:** [System response]
```

## Acceptance Criteria Format

Use pattern: `User [action] → System: [response]`

**Example:**
```markdown
### AC-1: Save Widget Preferences

User taps Save button → System:
- Validates minimum 1 widget enabled [Ref: SRS-TOD-010-V1]
- Persists preferences to database
- Displays success toast
- Provides haptic feedback
```

**Guidelines:**
- Focus on observable behavior (not implementation)
- Use bullet list for multi-step responses
- Never embed code - describe behavior only

## Code References

User stories describe **WHAT** (behavior), not **HOW** (code).

**Never embed code blocks** - SQL, JavaScript, JSON belong in SRS documents.

**When referencing implementation:** `[Ref: DOC-TYPE-MODULE-ITEM]`

Examples:
- `[Ref: SRS-TOD-010-V1]` - validation logic
- `[Ref: SRS-TOD-010-Q1]` - SQL query
- `[Ref: FL-XXX-YYY]` - function spec

See: [`screen-visual-guidelines.md`](screen-visual-guidelines.md) for complete code prohibition list.

## INVEST Criteria

- **I**ndependent - No dependencies on other stories
- **N**egotiable - Details can be discussed
- **V**aluable - Provides user/business value
- **E**stimable - Can be sized
- **S**mall - Fits in a sprint
- **T**estable - Has pass/fail criteria

## Visual Properties (EXCLUDED)

User stories focus on **behavior and value**, not visual implementation.

**Never include:**
- **Colors:** No hex codes, RGB, design tokens (e.g., "primary-500")
- **Typography:** No fonts, sizes, weights (e.g., "Inter 16px bold")
- **Spacing:** No padding, margin, gap (e.g., "16px padding")
- **Effects:** No shadows, borders, curves, radius (e.g., "8px border radius")
- **Layout:** No positioning, alignment specs (e.g., "centered", "fixed top")

> Visual specs = Figma only. User stories describe WHAT user achieves, not HOW it looks.

**See:** [`screen-visual-guidelines.md`](screen-visual-guidelines.md) for detailed guidance.

## What NOT to Include

User stories focus on **WHAT** user achieves, not implementation details.

**Exclude from user stories:**
- Metadata tags (use filename: US-XXX-NNN)
- Post-conditions (implied by AC completion)
- NFRs - performance/security specs (use Function List)
- UX/UI specifications (use Figma, Screen Description)
- Visual properties - color, radius, spacing, typography (use Figma)
- Dependencies (use project roadmap)
- Testing scenarios (use QA test plans)

**Remember:** Describe user value and observable behavior only.
