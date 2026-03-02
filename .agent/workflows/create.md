---
description: Create new application command. Triggers App Builder skill and starts interactive dialogue with user.
---

# /create - Create Application

$ARGUMENTS

---

## Task

This command starts a new application creation process.

### Steps:

1. **Request Analysis**
   - Understand what the user wants
   - If information is missing, use `conversation-manager` skill to ask

2. **Project Planning**
   - Use `project-planner` agent for task breakdown
   - Determine tech stack
   - Plan file structure
   - Create plan file and proceed to building

3. **Application Building (After Approval)**
   - Orchestrate with `app-builder` skill
   - Coordinate expert agents:
     - `database-architect` → Schema
     - `backend-specialist` → API
     - `frontend-specialist` → UI

4. **Preview**
   - Start with `auto_preview.py` when complete
   - Present URL to user

---

## Usage Examples

```
/create blog site
/create e-commerce app with product listing and cart
/create todo app
/create Instagram clone
/create crm system with customer management
```

---

## Before Starting

If request is unclear, ask these questions:
- What type of application?
- What are the basic features?
- Who will use it?

Use defaults, add details later.

---

## Figma Design Input

If user provides a Figma link, fetch design specs first:

```bash
# Parse: https://www.figma.com/design/FILE_KEY/NAME?node-id=NODE_ID
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_file_nodes","arguments":{"fileKey":"FILE_KEY","node_ids":["NODE_ID"],"depth":2}}}' | \
  FIGMA_ACCESS_TOKEN="$TOKEN" npx -y mcp-figma
```

> ⚠️ **Image Export**: Use `format: "jpg"`, `scale: 0.5`, resize with `sips -Z 1200` before reading.
> Large PNGs (2900px+) will crash context. Prefer `get_file_nodes` JSON data over images.
