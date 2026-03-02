# Screen Description - Visual Properties Guidelines

**CRITICAL:** Screen descriptions focus on BEHAVIOR and DATA only. All visual specifications come from Figma.

---

## Exact Text Capture (REQUIRED)

**ALWAYS capture UI text EXACTLY as shown in Figma.** This is NOT visual - it's functional content.

### What MUST Be Captured Exactly

| Category | Examples |
|----------|----------|
| Button labels | `"Log In"`, `"Sign Up"`, `"Submit"`, `"Cancel"` |
| Field labels | `"Email Address"`, `"Password"`, `"Full Name"` |
| Placeholder text | `"Enter your email"`, `"Select an option"`, `"Search..."` |
| Helper/Description text | `"We'll never share your email"`, `"Min 8 characters"` |
| Error messages | `"Invalid email format"`, `"This field is required"` |
| Tooltip text | `"Collect duplicate pieces to exchange for Gacha tickets"` |
| Tab names | `"Gacha"`, `"My SGT"`, `"History"`, `"Settings"` |
| Section headers | `"Recent Transaction"`, `"Story Covers"`, `"Exchange Duplicates"` |
| Badge/Tag labels | `"New"`, `"Success"`, `"Pending"`, `"Failed"` |
| Empty state messages | `"No transactions yet"`, `"Play Gacha to collect!"` |
| Success/Error toasts | `"Exchanged for 1 Regular Ticket"` |

### Format for Exact Text

Use backticks with quotes: `` `"exact text from Figma"` ``

```markdown
| Field Name | Data Type | Description & Rules |
|------------|-----------|---------------------|
| Email | Text | User email. **Label:** `"Email Address"` **Placeholder:** `"Enter your email"` |

| Button Name | Type | Description & Rules |
|-------------|------|---------------------|
| Submit | Primary | Submit form. **Label:** `"Submit Order"` |
```

### Why This Matters

- **Localization:** Exact text is needed for i18n/translation
- **QA testing:** Testers verify against exact expected text
- **Consistency:** Same text across platforms (iOS/Android/Web)
- **Accessibility:** Screen readers announce exact labels

---

## What NOT to Include

Screen descriptions should NEVER contain:

- **Colors:** No hex codes, RGB values, color names, or design tokens
  - ❌ "Background: #F3F4F6"
  - ❌ "Border: red"
  - ❌ "Text: primary-500"

- **Typography:** No font families, sizes, weights, or line heights
  - ❌ "Font: Inter 16px"
  - ❌ "Bold heading"

- **Spacing:** No padding, margin, gap, or layout measurements
  - ❌ "Padding: 16px"
  - ❌ "Gap between fields: 8px"

- **Visual Effects:** No shadows, gradients, borders, or decorative properties
  - ❌ "Drop shadow: 0px 4px 6px rgba(0,0,0,0.1)"
  - ❌ "Rounded corners: 8px"

---

## What TO Include

Focus on functional and behavioral descriptions:

- **Field purpose:** What data does it capture?
- **Data type:** Text, Number, Date, Select, Boolean, etc.
- **Validation rules:** Required, max length, format, allowed values
- **Business logic:** Calculations, conditions, dependencies
- **Actions:** What happens when user interacts?
- **States:** Enabled/disabled, visible/hidden, required/optional
- **Navigation:** Where does action lead?

---

## The Rule

> If it changes when the design system updates, it doesn't belong in screen description.

**Visual specs = Figma only**

---

## Common Mistakes to Avoid

### ❌ Incorrect: Visual Descriptions

| Field Name | Data Type | Description & Rules |
|------------|-----------|---------------------|
| Status Badge | Tag | Red background (#FF0000), white text, 8px padding |
| Header Title | Text | Bold, 24px, Inter font family |
| Card Container | Container | Border radius 12px, shadow 0 4px 6px rgba(0,0,0,0.1) |
| Primary Button | Button | Blue (#3B82F6), hover: darker blue (#2563EB) |

**Problem:** Describes HOW it looks (visual implementation), not WHAT it does (functional purpose).

---

### ✅ Correct: Behavioral Descriptions

| Field Name | Data Type | Description & Rules |
|------------|-----------|---------------------|
| Status Badge | Tag | Order status indicator. Values: Pending, Confirmed, Shipped, Delivered |
| Header Title | Text | Page heading showing current section name. Max 60 characters |
| Card Container | Container | Groups related order information (ID, date, total, items) |
| Primary Button | Button | Submit order for processing. Disabled if validation fails |

**Why Better:** Describes WHAT data is shown and WHAT happens on interaction. Visual specs in Figma.

---

## Quick Reference

| Visual Property | BSA Document | Where to Find |
|-----------------|--------------|---------------|
| Colors | ❌ Don't include | Figma design system |
| Fonts | ❌ Don't include | Figma typography tokens |
| Spacing | ❌ Don't include | Figma layout specs |
| Effects | ❌ Don't include | Figma component variants |
| Data behavior | ✅ Required | Screen description |
| Validation rules | ✅ Required | Screen description |
| Navigation | ✅ Required | Screen description |
