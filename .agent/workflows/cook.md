---
description: Implement a feature step by step (ClaudeKit cook workflow)
---

# /ck:cook — Implement Features Step by Step

$ARGUMENTS

---

## Purpose

Full-cycle implementation workflow ported from ClaudeKit. Handles everything from research to deployment.

**Workflow: Research → Plan → Implement → Test → Code Review → Documentation → Final Report**

## Behavior

### 1. Understand the Request
- If unclear, ask clarifying questions (1 at a time)
- Apply YAGNI, KISS, DRY principles

### 2. Research
- Use `explorer-agent` to research the codebase and find relevant files
- Use `web-search` skill for external research if needed
- Keep research reports ≤150 lines

### 3. Plan
- Use `project-planner` agent to create implementation plan
- Save plan in `plans/` directory using structure:
  ```
  plans/{YYMMDD-HHmm}-{task-slug}/
  ├── plan.md           # Overview (≤80 lines)
  └── phase-XX-*.md     # Phase files
  ```
- **DO NOT start implementing** until plan is reviewed

### 4. Implement
- Follow the plan step by step
- For UI work: use `frontend-specialist` agent + `frontend-design` skill
- For backend: use `backend-specialist` agent + `api-patterns` skill
- Run type checking after each phase

### 5. Test
- Write real tests (no mocks/fakes just to pass)
- Use `test-engineer` agent to run tests
- If failures: use `debugger` agent to find root cause
- Repeat until all tests pass

### 6. Code Review
- Apply `code-review` skill to review changes
- Fix critical issues, re-run tests
- Repeat until clean

### 7. Documentation
- Update docs in `./docs/` if needed
- Use `documentation-writer` agent

### 8. Final Report
- Summary of changes (concise)
- Guide user to get started
- Ask if user wants to commit (run git commands directly)
- List unresolved questions at end

## Key Principles
- **Brutal honesty** about feasibility and trade-offs
- **Sacrifice grammar** for concision in reports
- **No fake data** in tests
- **Question everything** — don't assume
