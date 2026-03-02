# Figma MCP Usage Reference (Framelink)

> Hướng dẫn sử dụng Framelink MCP server để đọc Figma designs.
> Package: `figma-developer-mcp` — Simplifies Figma API data trước khi trả về AI.

---

## Quick Start

### 1. Setup MCP Server

```json
// .mcp.json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--stdio"],
      "env": {
        "FIGMA_API_KEY": "figd_YOUR_TOKEN"
      }
    }
  }
}
```

### 2. Parse Figma URL

```
URL: https://www.figma.com/design/FILE_KEY/NAME?node-id=NODE_ID
                                 ^^^^^^^^              ^^^^^^^
                                 fileKey                nodeId
```

### 3. Fetch Data

```bash
# Via MCP tool (preferred) — AI sẽ tự gọi
get_figma_data(fileKey="FILE_KEY", nodeId="NODE_ID")
```

---

## Available Tools

| Tool | Input | Output |
|------|-------|--------|
| `get_figma_data` | fileKey, nodeId?, depth? | Simplified design (layout, text, visuals, components, styles) |
| `download_figma_images` | fileKey, nodeId, format?, scale? | Downloaded image files |

> **Chỉ 2 tools** thay vì 6 tools cũ. `get_figma_data` tự tích hợp components + styles.

---

## So sánh tools cũ → mới

| Tool cũ (mcp-figma) | Tool mới (Framelink) |
|---------------------|----------------------|
| `get_file` | `get_figma_data` (fileKey only) |
| `get_file_nodes` | `get_figma_data` (fileKey + nodeId) |
| `get_image` | `download_figma_images` |
| `get_file_components` | Tích hợp trong `get_figma_data` |
| `get_file_styles` | Tích hợp trong `get_figma_data` |
| `get_comments` | ❌ Không hỗ trợ |

---

## Response Structure

Framelink trả về **simplified design** (YAML mặc định):

```yaml
metadata:
  name: "Screen Name"
nodes:
  - name: "Header"
    type: FRAME
    layoutMode: HORIZONTAL
    width: 390
    height: 64
    padding: { top: 16, bottom: 16, left: 20, right: 20 }
    children:
      - name: "Title"
        type: TEXT
        characters: "Dashboard"
        fontSize: 18
        fontWeight: 600
components:
  "1:234":
    name: "Button/Primary"
    description: "Primary action button"
globalVars:
  styles:
    "S:abc123":
      name: "Primary"
      type: FILL
```

### Key Differences vs Raw API

| Aspect | Raw API (cũ) | Framelink (mới) |
|--------|-------------|-----------------|
| Hidden nodes | Có | ❌ Filtered out |
| SVG vectors | Hàng trăm path points | Collapsed vào 1 SVG container |
| Absolute positions | Có | Chỉ giữ relevant layout props |
| Plugin data | Có | ❌ Removed |
| Token size | 50k-200k+ | **5k-20k** |

---

## ⚠️ Context Optimization Rules

1. **Luôn dùng `nodeId`** — fetch từng screen/frame thay vì toàn bộ file
2. **Depth mặc định = unlimited** — chỉ set depth khi cần giới hạn
3. **Download images**: dùng `download_figma_images` thay vì image URLs
4. **Nếu vẫn lớn**: set `depth=2` để chỉ lấy 2 cấp

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 403 Invalid token | Tạo token mới tại Figma Settings |
| MCP not loading | Restart Claude Code session |
| Empty response | Kiểm tra fileKey và nodeId |
| Response quá lớn | Dùng nodeId cụ thể + depth=2 |

---

## Multi-Project Config

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--stdio"],
      "env": { "FIGMA_API_KEY": "${FIGMA_ACCESS_TOKEN}" }
    },
    "AMS Figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--stdio"],
      "env": { "FIGMA_API_KEY": "${FIGMA_ACCESS_TOKEN_AMS}" }
    }
  }
}
```
