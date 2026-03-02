---
description: Bootstrap a new project step by step (ClaudeKit bootstrap workflow)
---

# /ck:bootstrap-ck — Bootstrap New Project

$ARGUMENTS

---

## Purpose

Full project bootstrap workflow from ClaudeKit. Creates a complete project from scratch with research, planning, design, implementation, testing, and documentation.

## Behavior

### 1. Clarify Requirements
- Ask clarifying questions (1 at a time) using Socratic approach
- Understand user's request, constraints, and objectives
- Don't assume — clarify until 100% certain

### 2. Research
- Use `explorer-agent` with `web-search` skill to research solutions
- Explore frameworks, tools, and best practices
- Keep research reports ≤150 lines

### 3. Tech Stack
- Ask user for preferred tech stack
- If no preference: use `project-planner` to recommend options
- Write approved tech stack to `./docs/tech-stack.md`

### 4. Planning
- Use `project-planner` agent to create implementation plan
- Save in `plans/` directory (plan.md + phase files)
- **DO NOT implement** — wait for user approval

### 5. Wireframe & Design (Optional)
- Ask user if they want wireframes
- If yes: use `frontend-specialist` with `ui-ux-pro-max` skill
- Create design guidelines at `./docs/design-guidelines.md`
- Generate wireframes in `./docs/wireframes/`

### 6. Implementation
- Follow the plan step by step
- Use appropriate specialist agents
- Run type checking after each phase

### 7. Testing
- Write real tests covering all cases
- Use `test-engineer` agent to run tests
- Use `debugger` if failures occur
- No fake data or mocks just to pass

### 8. Code Review
- Apply `code-review` skill
- Fix critical issues, re-run tests

### 9. Documentation
- Create/update `./docs/README.md`
- Create/update `./docs/ck:codebase-summary.md`
- Create/update `./docs/system-architecture.md`
- Create/update `./docs/ck:code-standards.md`

### 10. Onboarding
- Guide user to get started (API keys, env vars, etc.)
- Configure step by step (1 question at a time)

### 11. Final Report
- Summary of all changes
- Guide to get started
- Ask about git commit
- List unresolved questions

## Key Principles
- **YAGNI, KISS, DRY** — the holy trinity
- **Brutal honesty** about trade-offs
- **Git first** — check if Git initialized, offer to init
