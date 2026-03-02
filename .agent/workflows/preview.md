---
description: Preview server start, stop, and status check. Local development server management.
---

# /ck:preview - Preview Management

$ARGUMENTS

---

## Task

Manage preview server: start, stop, status check.

### Commands

```
/ck:preview           - Show current status
/ck:preview start     - Start server
/ck:preview stop      - Stop server
/ck:preview restart   - Restart
/ck:preview check     - Health check
```

---

## Usage Examples

### Start Server
```
/ck:preview start

Response:
🚀 Starting preview...
   Port: 3000
   Type: Next.js

✅ Preview ready!
   URL: http://localhost:3000
```

### Status Check
```
/ck:preview

Response:
=== Preview Status ===

🌐 URL: http://localhost:3000
📁 Project: C:/projects/my-app
🏷️ Type: nextjs
💚 Health: OK
```

### Port Conflict
```
/ck:preview start

Response:
⚠️ Port 3000 is in use.

Options:
1. Start on port 3001
2. Close app on 3000
3. Specify different port

Which one? (default: 1)
```

---

## Technical

Auto preview uses `auto_preview.py` script:

```bash
python ~/.claude/scripts/auto_preview.py start [path] [port]
python ~/.claude/scripts/auto_preview.py stop
python ~/.claude/scripts/auto_preview.py status
```
