---
description: Bridge to ClaudeKit commands. Run any ClaudeKit command from Antigravity.
---

# /claudekit — ClaudeKit Bridge

$ARGUMENTS

---

## Purpose

Master bridge to execute **any ClaudeKit command** from within Antigravity agent system.

## Usage

```
/claudekit <command> [arguments]
/claudekit plan:fast build auth system
/claudekit bootstrap create a SaaS app
/claudekit preview --explain OAuth flow
/claudekit watzup
/claudekit journal
```

## Execution Protocol

1. **Parse arguments**: Extract `<command>` (first word) and `<task>` (remaining words)
2. **Resolve command file** using these rules:
   - If command contains `:` (e.g., `plan:fast`) → read `.claude/commands/ck:plan/fast.md`
   - If command has no `:` → read `.claude/commands/<command>.md`
   - If not found → check `.claude/commands-archived/<command>.md`
   - If still not found → report error with available commands
3. **Read the command file** from resolved path
4. **Replace `$ARGUMENTS`** in the command file with `<task>`
5. **Map ClaudeKit subagents → Antigravity agents** (see table below)
6. **Execute** the command logic using Antigravity's agent system

## Agent Mapping

When ClaudeKit commands reference subagents, use these Antigravity equivalents:

| ClaudeKit Subagent | Antigravity Agent | Skills |
|---|---|---|
| `researcher` | `explorer-agent` | web-search, research |
| `planner` | `project-planner` | plan-writing, architecture |
| `tester` | `test-engineer` | testing-patterns, tdd-workflow |
| `debugger` | `debugger` | systematic-debugging |
| `code-reviewer` | use `code-review` skill | code-review-checklist |
| `ui-ux-designer` | `frontend-specialist` | frontend-design, ui-ux-pro-max |
| `docs-manager` | `documentation-writer` | documentation-templates |
| `git-manager` | run git commands directly | — |
| `project-manager` | `product-manager` | feature-spec, roadmap-management |
| `fullstack-developer` | `frontend-specialist` + `backend-specialist` | react-patterns, api-patterns |

## Skill Activation

When ClaudeKit commands say "Analyze the skills catalog and activate skills", read skills from:
- `.claude/skills/` (ClaudeKit skills)
- `.agent/skills/` (Antigravity skills — preferred, more comprehensive)

Prefer Antigravity skills when both exist for same domain.

## Plan File Convention

ClaudeKit uses `plans/` directory for structured plans:
```
plans/{YYMMDD-HHmm}-{task-slug}/
├── plan.md           # Overview (≤80 lines)
├── phase-01-*.md     # Phase files
├── research/         # Research reports (≤150 lines each)
└── reports/          # Execution reports
```
Follow this convention when executing ClaudeKit planning commands.

## Quick Reference

### Most Used Commands
| Command | Description |
|---|---|
| `/claudekit plan [task]` | Create implementation plan |
| `/claudekit plan:fast [task]` | Quick planning |
| `/claudekit plan:hard [task]` | Complex planning |
| `/claudekit bootstrap [req]` | Bootstrap new project |
| `/claudekit ask [question]` | Architecture consultation |
| `/claudekit preview [path]` | Preview files/diagrams |
| `/claudekit watzup` | Review recent changes |
| `/claudekit journal` | Write dev journal |
| `/claudekit test` | Run tests |
| `/claudekit kanban` | Kanban board |

### BMAD Commands (also accessible)
| Command | Description |
|---|---|
| `/claudekit bmad-help` | BMAD guided help |
| `/claudekit bmad-bmm-create-prd` | Create PRD |
| `/claudekit bmad-bmm-create-architecture` | Create architecture |
| `/claudekit bmad-bmm-create-epics-and-stories` | Create epics & stories |
| `/claudekit bmad-bmm-sprint-planning` | Sprint planning |
| `/claudekit bmad-bmm-dev-story` | Implement story |
| `/claudekit bmad-bmm-code-review` | Code review |

For full list, run `/claudekit-help`.
