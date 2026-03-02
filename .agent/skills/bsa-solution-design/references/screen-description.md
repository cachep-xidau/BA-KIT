# Screen Description

Write screen specifications using 3-section structure: Overview, Fields, Action Buttons.

## CRITICAL: Exact Text Capture

**ALWAYS capture text EXACTLY as shown in Figma.** Never paraphrase, translate, or modify.

| Element | Capture Exactly |
|---------|-----------------|
| Button labels | "Log In", "Sign Up", "Submit Order" (exact case, spacing) |
| Field names | "Email Address", "Confirm Password" |
| Default/placeholder text | "Enter your email", "Select an option" |
| Descriptions | "We'll never share your email" |
| Error messages | "Invalid email format" |
| Tooltip text | "Collect duplicate pieces to exchange for Gacha tickets" |
| Tab names | "Gacha", "My SGT", "History" |
| Badge labels | "New", "Success", "Pending" |

**Format:** Use quotes `"..."` to denote exact UI text from Figma.

---

## Quick Start

```markdown
# Login Screen

**Figma:** [link]

## Overview
User authentication entry point.

## Fields

| Field Name | Data Type | Description & Rules |
|------------|-----------|---------------------|
| Email | Text | User email. Required, valid email format |
| Password | Password | User password. Required, min 8 chars |

## Action Buttons

| Button Name | Type | Description & Rules |
|-------------|------|---------------------|
| Login | Primary | Authenticate user. Disabled if validation fails |
| Forgot Password | Link | Navigate to password reset screen |
```

> Full templates below. Visual guidelines: [`screen-visual-guidelines.md`](screen-visual-guidelines.md)

## Single Screen Template

```markdown
# [Screen Name]

**Figma:** [Design link]

## Overview
[1-2 sentence description of screen purpose and user context]

## Fields

| Field Name | Data Type | Description & Rules |
|------------|-----------|---------------------|
| [name] | [type] | [description]. **Label:** `"[exact Figma text]"` **Placeholder:** `"[exact Figma text]"` |

> **Note:** Include `Label` and `Placeholder` with exact Figma text when applicable.

## Action Buttons

| Button Name | Type | Description & Rules |
|-------------|------|---------------------|
| [name] | [type] | [action/navigation]. **Label:** `"[exact Figma text]"` |

> **Note:** Always include `Label` with exact button text from Figma.
```

> **Multi-screen docs:** Repeat the single screen structure for each screen. See Complete Example below.

## Complete Example

```markdown
# Gacha Main Screen

**Figma:** [Link](https://www.figma.com/design/ju6u14HWyOQ6DKvElpVog6/AMS-202601?node-id=945-16786)

## Overview
Main entry point for Gacha system. Select Premium/Regular machines, view tickets.

## Fields

| Field Name | Data Type | Description & Rules |
|------------|-----------|---------------------|
| Gacha Type Tabs | Select | Tab selection. **Labels:** `"Gacha"`, `"Subscription"`, `"Collection card"` |
| Ticket Count | Number | Available Premium tickets. **Format:** `"x15"` |
| Machine Status | Display | Premium or Regular machine indicator |
| History Preview | List | Last 3 opened cards with Rarity and Time. **Format:** `"5m ago"` |

## Action Buttons

| Button Name | Type | Description & Rules |
|-------------|------|---------------------|
| Select Premium | Primary | Activate Premium machine context. **Label:** `"Premium"` |
| View All History | Link | Navigate to Gacha History screen. **Label:** `"View All"` |
| Tab: Gacha | Tab | Current screen. **Label:** `"Gacha"` |
| Tab: Subscription | Tab | Navigate to Subscription screen. **Label:** `"Subscription"` |
```
