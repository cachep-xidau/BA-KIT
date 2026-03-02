---
description: Fix issues — fast, hard, types, test, ui, ci (ClaudeKit fix workflow)
---

# /ck:fix — Fix Issues

$ARGUMENTS

---

## Purpose

Dispatcher for all fix-related commands from ClaudeKit.

## Usage

```
/ck:fix [issue]                 # Auto-detect fix type
/ck:fix fast [issue]            # Quick fixes (< 5 min)
/ck:fix hard [issue]            # Complex issues (multi-file)
/ck:fix types                   # Fix TypeScript errors
/ck:fix test [issue]            # Fix test failures
/ck:fix ui [issue]              # Fix UI issues
/ck:fix ci [url]                # Fix CI/CD issues
```

## Behavior

### 1. Classify Fix Type

Parse first word of arguments to determine fix type:
- `fast` → Quick fix mode
- `hard` → Deep investigation mode
- `types` → TypeScript error fix mode
- `test` → Test failure fix mode
- `ui` → UI/visual fix mode
- `ci` → CI/CD fix mode
- *(no keyword)* → Auto-detect based on issue description

### 2. Quick Fix (`/ck:fix fast`)
- Read error message/context
- Identify root cause immediately
- Apply minimal fix
- Verify fix works
- No plan needed

### 3. Complex Fix (`/ck:fix hard`)
- Use `debugger` agent with `systematic-debugging` skill
- 4-phase debugging: Reproduce → Isolate → Identify → Fix
- Create minimal fix plan
- Test thoroughly

### 4. TypeScript Fix (`/ck:fix types`)
- Run `npx tsc --noEmit` to get errors
- Fix type errors systematically
- Re-run until clean

### 5. Test Fix (`/ck:fix test`)
- Run test suite, capture failures
- Use `debugger` agent to analyze
- Fix code (not tests) unless tests are wrong
- Re-run until all pass

### 6. UI Fix (`/ck:fix ui`)
- Use `frontend-specialist` agent
- Identify visual issue
- Apply CSS/component fix
- Verify visually

### 7. CI Fix (`/ck:fix ci`)
- Read CI logs from provided URL or recent run
- Identify failing step
- Fix configuration or code
- Verify locally before push

## Key Principles
- **Fix root cause**, not symptoms
- **Minimal changes** — don't refactor while fixing
- **Verify** every fix before reporting done
