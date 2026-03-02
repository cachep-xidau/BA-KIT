---
name: bsa-solution-design
description: Solution design for Business Systems Analysts. Use when creating technical specifications, defining integration patterns, designing APIs, planning data architecture, creating wireframes/mockups, writing user stories, or producing sequence diagrams. Covers ERD with DBML, UI/UX design, and integration patterns.
allowed-tools: Read, Glob, Grep
---

# BSA Solution Design

Guide BSAs through solution design from requirements to technical specifications.

## When to Use

Activate for:
- Technical specifications writing
- Integration pattern selection
- API design and documentation
- Data architecture planning (ERD, DBML)
- UI/UX wireframe guidance
- User story writing
- Function list (user perspective - what user sees/achieves)
- SRS (Software Requirements Specification)
- Use case diagram creation
- Sequence diagram creation

## Quick Reference

| Design Area | Reference | Use Case |
|-------------|-----------|----------|
| Integration | `references/integration-design.md` | APIs, messaging, sync/async patterns |
| Data | `references/data-architecture.md` | Schema, storage, migration strategy |
| ERD | `references/erd-dbdiagram.md` | DBML syntax for dbdiagram.io |
| UI/UX | `references/ui-ux-design.md` | Wireframes, user flows, accessibility |
| Screen Description | `references/screen-description.md` | Fields, action buttons, data types |
| User Story | `references/user-story.md` | Lean format: User → System AC (NO Given/When/Then, NO code blocks) |
| Function List | `references/function-list.md` | Main Flow + NFR only (NO Pre/Post-conditions, NO metadata) |
| SRS | `references/srs.md` | Business + System requirements, SQL scripts, API |
| Use Case Diagram | `references/use-case-diagram.md` | PlantUML syntax, actors, include/extend |
| Sequence Diagram | `references/sequence-diagram.md` | PlantUML syntax, alt/loop patterns, BSA rules |

> **Note:** For FR/NFR specs and Architecture patterns, see `bsa-analysis` skill. NFR details belong in Function List (not User Stories).

## Design Process

```
Requirements → Analysis → Design Options → Evaluation → Selection → Documentation
     ↓            ↓            ↓              ↓           ↓            ↓
   BRD/FRD    Gap/Impact   Alternatives    Criteria   Decision     SDD/Specs
```

## Key Design Principles

**SOLID**: Single responsibility, Open-closed, Liskov, Interface segregation, Dependency inversion
**DRY**: Don't Repeat Yourself - avoid duplication
**KISS**: Keep It Simple, Stupid - simplest solution that works
**YAGNI**: You Aren't Gonna Need It - no speculative features

## Design Decision Template

```
Decision: [What was decided]
Context: [Why decision needed]
Options: [Alternatives considered]
Rationale: [Why this option chosen]
Consequences: [Trade-offs, risks]
```

## Instructions

1. Identify design scope from requirements
2. Load relevant reference file(s)
3. Apply appropriate design patterns
4. Document decisions with rationale
5. Create diagrams (Mermaid/PlantUML)
6. Validate against NFRs
7. **Code Separation:** Never embed SQL/JavaScript/JSON in user stories - use SRS references
8. **Output Format:** Generate all documents in Markdown format following templates in reference files
9. **Exact Text Capture:** Always capture UI text EXACTLY as shown in Figma (button labels, field names, messages, tooltips, placeholders)

---

## Markdown Output Guidelines

**Standard format for all BSA documents (User Stories, Function Lists, SRS, Screen Descriptions)**

### Headers
- `# Title` - Document title (H1)
- `## Section` - Main sections (H2)
- `### Subsection` - Nested sections (H3)
- `#### Item` - Acceptance criteria, detailed items (H4)

### Tables
Use Markdown tables for structured data:
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data     | Data     | Data     |
```

### Code References
**CRITICAL:** Never embed SQL/JavaScript/JSON in User Stories
- Use `[Ref: DOC-TYPE-MODULE-FEATURE-ITEM]` notation
- All code belongs in SRS documents

### Exact Text Capture
**ALWAYS capture UI text exactly as shown in Figma:**
- Button labels: `"Submit"`, `"Cancel"`, `"Exchange"`
- Field names: `"Email Address"`, `"Password"`
- Placeholder text: `"Enter your email"`, `"Select an option"`
- Messages: `"Exchanged for 1 Regular Ticket"`
- Tooltips: `"Collect duplicate pieces to exchange for Gacha tickets"`
- Screen titles: `"Recent Transaction"`, `"Story Covers"`
- Format: Use backticks with quotes `` `"exact text"` ``

---

## User Story Code Migration Checklist

When reviewing or creating user stories, ensure code blocks removed:

**Prohibited in User Stories:**
- [ ] ❌ SQL queries (SELECT, INSERT, UPDATE, DELETE)
- [ ] ❌ JavaScript/TypeScript validation logic
- [ ] ❌ JSON configuration objects
- [ ] ❌ API request/response payloads
- [ ] ❌ Regular expressions
- [ ] ❌ Algorithm pseudocode

**Migration Steps:**
1. **Extract code** from user story acceptance criteria
2. **Create/update SRS** document with reference IDs (e.g., `[Ref: SRS-TOD-010-Q1]`)
3. **Replace code blocks** in user story with behavior descriptions + reference notation
4. **Add SRS link** to user story References section
5. **Verify** user story focuses on observable behavior only

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `bsa-analysis` | Requirements analysis, gap/impact analysis |
| `database-design` | Database schema, ERD |
| `api-patterns` | API design patterns |
| `frontend-design` | UI/UX implementation |
| `mcp-builder` | MCP server integration, Figma MCP |

---

## Figma Integration (MCP)

Read designs directly via MCP tools. Multiple accounts available.

### Account Routing

| Project | MCP Prefix | Tools |
|---|---|---|
| Default | `mcp__figma__` | `get_figma_data`, `download_figma_images` |
| AMS | `mcp__AMS_Figma__` | Same tools |
| A2V | `mcp__A2V__` | Same tools |
| AMS-Web3 | `mcp__AMS-Web3__` | Same tools |
| Raw API (deep) | `mcp__figma-a2v__` | `get_file_nodes`, `get_file_styles`, `get_file_components`, `get_comments` |

### BSA Workflow: Figma → Screen Description

```
1. Nhận Figma URL từ designer
   └─ https://www.figma.com/design/FILE_KEY/NAME?node-id=NODE_ID

2. Call get_figma_data(fileKey, nodeId) — simplified layout
   └─ Or get_file_nodes(fileKey, node_ids) for deep analysis

3. Phân tích data → Tạo Screen Description
   └─ Dùng references/screen-description.md template

4. Nếu cần visual: download_figma_images(fileKey, nodes)
   └─ Dùng để verify layout, color, spacing
```

### Context Budget

| Action | Token est. | Note |
|---|---|---|
| 1 screen (get_figma_data) | ~5k-20k | Depends on complexity |
| 5 screens/session | ~25k-100k | Feasible with Framelink |
| 1 image download | ~5k-15k | Use jpg format |

**Tips:** Always use `nodeId` — fetch per screen, not entire file. Batch 3-5 related screens per session.

## Playwright Verification

Validate prototype against design specs:
- `mcp__playwright__browser_navigate(url)` → Open prototype
- `mcp__playwright__browser_snapshot()` → Get accessibility tree for structure comparison
- `mcp__playwright__browser_take_screenshot()` → Visual comparison with Figma exports

