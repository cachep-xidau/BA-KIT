---
description: Git operations — commit, push, pull request (ClaudeKit git workflow)
---

# /git — Git Operations

$ARGUMENTS

---

## Purpose

Quick git operations from ClaudeKit.

## Usage

```
/git cm                      # Stage all + commit with smart message
/git cp                      # Stage all + commit + push
/git pr [branch] [base]      # Create pull request
```

## Behavior

### `/git cm` — Commit
1. Run `git status` to see changes
2. Run `git diff --stat` for summary
3. Generate a **conventional commit message** based on changes:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `refactor:` for refactoring
   - `docs:` for documentation
   - `chore:` for maintenance
4. Show proposed message, ask user to approve or edit
5. Run `git add -A && git commit -m "<message>"`

### `/git cp` — Commit + Push
1. Do everything from `/git cm`
2. Then `git push origin <current-branch>`

### `/git pr` — Pull Request
1. Parse arguments: `[branch]` (source), `[base]` (target, default: main)
2. Run `git log <base>..<branch> --oneline` for change summary
3. Generate PR title + description
4. Run `gh pr create --title "<title>" --body "<body>" --base <base>`
5. If `gh` not installed, provide manual PR link

## Key Principles
- **Smart commit messages** — analyze diff, not generic messages
- **Conventional commits** — always use prefixes
- **Ask before push** — never auto-push without confirmation
