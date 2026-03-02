# Hooks System

This directory contains Claude Code hooks for quality enforcement.

## Active Hooks

### PreToolUse Hooks

| Script | Trigger | Purpose |
|--------|---------|---------|
| `scout-block.js` | Bash commands | Blocks access to heavy directories (node_modules, .git/, dist/, build/) |

### PostToolUse Hooks

| Script | Trigger | Purpose |
|--------|---------|---------|
| `modularization-hook.js` | Write, Edit | Warns when file exceeds 200 lines (non-blocking) |

## Configuration

Hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$CLAUDE_PROJECT_DIR\"/.agent/hooks/ck:scout-block.js"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$CLAUDE_PROJECT_DIR\"/.agent/hooks/modularization-hook.js"
          }
        ]
      }
    ]
  }
}
```

## Adding New Hooks

1. Create hook script in this directory
2. Add configuration to `.claude/settings.json`
3. Test with `echo '{"tool_input": {...}}' | node your-hook.js`

## Debugging

Enable debug mode for modularization hook:
```bash
MODULARIZATION_HOOK_DEBUG=true node modularization-hook.js
```
