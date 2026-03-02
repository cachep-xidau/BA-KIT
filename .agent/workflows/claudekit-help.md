---
description: List all available ClaudeKit commands and usage guide
---

# /claudekit-help — ClaudeKit Commands Guide

$ARGUMENTS

---

## Purpose

Display all available ClaudeKit commands accessible through the `/claudekit` bridge, plus direct shortcut workflows.

## Behavior

Present this reference to the user:

---

### ⚡ Direct Antigravity Workflows (native)

These run directly — no prefix needed:

| Command | Description |
|---|---|
| `/ck:brainstorm [topic]` | Structured idea exploration (3 options) |
| `/create [app]` | Create new application |
| `/ck:debug [issue]` | Systematic debugging |
| `/deploy` | Deploy application |
| `/enhance [feature]` | Improve existing code |
| `/orchestrate [task]` | Multi-agent coordination |
| `/ck:plan [task]` | Task breakdown |
| `/ck:preview` | Preview changes |
| `/status` | Check project status |
| `/ck:test` | Run tests |
| `/ui-ux-pro-max [task]` | Design with 50 styles |
| `/bsa [task]` | Business System Analysis |

### 🔌 ClaudeKit Shortcut Workflows

These are ported ClaudeKit commands with their own workflow files:

| Command | Description |
|---|---|
| `/ck:cook [task]` | Implement features step by step |
| `/ck:fix [issue]` | Fix issues (fast/hard/types/ck:test/ui/ci) |
| `/git cm` | Smart commit |
| `/git cp` | Commit + push |
| `/git pr` | Create pull request |
| `/ck:ask [question]` | Architecture consultation |
| `/ck:bootstrap-ck [req]` | Bootstrap new project |

### 🌉 Via Bridge (`/claudekit <command>`)

Access ALL 53 ClaudeKit commands + 30 BMAD commands:

**Planning:**
- `/claudekit plan [task]` — Create plan
- `/claudekit plan:fast [task]` — Quick plan
- `/claudekit plan:hard [task]` — Complex plan
- `/claudekit plan:two [task]` — 2 alternatives
- `/claudekit plan:ci` — CI analysis

**Documentation:**
- `/claudekit docs:init` — Init docs structure
- `/claudekit docs:update` — Update docs
- `/claudekit docs:summarize` — Summarize codebase

**Preview & Review:**
- `/claudekit preview [path]` — View files/generate diagrams
- `/claudekit preview --explain [topic]` — Visual explanation
- `/claudekit review:codebase` — Analyze codebase
- `/claudekit watzup` — Review recent changes
- `/claudekit journal` — Development log

**Other:**
- `/claudekit kanban` — Kanban board
- `/claudekit test:ui` — UI testing
- `/claudekit use-mcp` — Use MCP servers
- `/claudekit coding-level` — Set coding level
- `/claudekit worktree` — Git worktree management

**BMAD Commands:**
- `/claudekit bmad-help` — BMAD guided help
- `/claudekit bmad-bmm-create-prd` — Create PRD
- `/claudekit bmad-bmm-create-architecture` — Architecture doc
- `/claudekit bmad-bmm-create-epics-and-stories` — Epics & stories
- `/claudekit bmad-bmm-sprint-planning` — Sprint planning
- `/claudekit bmad-bmm-dev-story` — Implement story
- `/claudekit bmad-bmm-code-review` — Code review
- `/claudekit bmad-brainstorming` — BMAD brainstorm

### 💡 Example Workflow Chains

```
# Full product development
/ck:brainstorm → /claudekit plan:hard → /ck:cook → /git cp

# Quick fix
/ck:fix fast the button is broken

# BMAD agile flow
/claudekit bmad-bmm-create-prd → /claudekit bmad-bmm-create-architecture → /claudekit bmad-bmm-sprint-planning → /claudekit bmad-bmm-dev-story

# Architecture question
/ck:ask how to design a scalable auth system
```
