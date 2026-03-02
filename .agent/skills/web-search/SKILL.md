---
name: web-search
description: Intelligent web search with multi-strategy fallback. Use when fetching web content, researching URLs, or web search returns 403/blocked errors.
context: fork
---

# Web Search - Multi-Strategy Fallback

Smart web content retrieval with automatic fallback when sites block requests.

## Strategy Chain

```
WebSearch (quick info) → WebFetch (full page) → Playwright (anti-bot bypass) → Tavily (deep search)
```

Pick the right tool for the job, fallback on failure.

## When to Use Each Tool

| Tool | Use When | Strengths | Weaknesses |
|------|----------|-----------|------------|
| **WebSearch** | Need quick facts, summaries, multiple sources | Fast, no 403 | No full page content |
| **WebFetch** | Need full page content from a URL | Full HTML→markdown | Blocked by Cloudflare/403 |
| **Playwright** | WebFetch returns 403/blocked | Real browser, JS rendering | Slower, heavier |
| **Tavily** | Deep research, AI-optimized results | Clean structured data | Needs API key |

## Fallback Protocol

### Step 1: Assess the request

- **"Search for X"** → Start with `WebSearch`
- **"Read this URL"** → Start with `WebFetch`
- **"Research topic deeply"** → Start with `WebSearch` + `Tavily` (if available)

### Step 2: On failure, fallback

```
WebFetch fails (403/timeout)?
  └── Use Playwright:
      1. mcp__playwright__browser_navigate → target URL
      2. mcp__playwright__browser_snapshot → get page content
      3. Extract needed info from snapshot
      4. mcp__playwright__browser_close → cleanup

WebSearch returns no useful results?
  └── Try Tavily MCP (if configured):
      mcp__tavily__search → query
  └── Or try Playwright to scrape search results manually
```

### Step 3: Combine results

When researching a topic, combine multiple tools:
```
1. WebSearch → get overview + multiple source URLs
2. WebFetch each URL → get details (parallel)
3. Failed URLs → Playwright fallback (parallel)
4. Synthesize all results
```

## Playwright Web Scraping Patterns

### Read a blocked page
```
1. mcp__playwright__browser_navigate(url)
2. mcp__playwright__browser_snapshot() → get structured content
3. If page requires scrolling: mcp__playwright__browser_press_key("End")
4. mcp__playwright__browser_snapshot() → get remaining content
5. mcp__playwright__browser_close()
```

### Search + scrape results
```
1. mcp__playwright__browser_navigate("https://www.google.com")
2. mcp__playwright__browser_type(ref, query, submit=true)
3. mcp__playwright__browser_snapshot() → extract results
4. mcp__playwright__browser_click(ref) → visit result
5. mcp__playwright__browser_snapshot() → get content
```

### Handle dynamic pages (SPA)
```
1. mcp__playwright__browser_navigate(url)
2. mcp__playwright__browser_wait_for(text="expected content")
3. mcp__playwright__browser_snapshot()
```

## Tavily MCP (Optional Enhancement)

### Setup
```bash
claude mcp add tavily -e TAVILY_API_KEY="tvly-YOUR_KEY" -- npx -y tavily-mcp

# Verify connection:
claude mcp list | grep tavily
```

### When configured, use for:
- **Deep research** — AI-optimized search results with relevance scoring
- **Fact checking** — Cross-reference claims across multiple sources
- **Content extraction** — Pull structured content from specific URLs

### Tavily tools (when available):
- `mcp__tavily__tavily-search` — Web search with AI-ranked results
- `mcp__tavily__tavily-extract` — Extract content from specific URLs

### Tavily vs WebSearch comparison:
| Aspect | WebSearch | Tavily |
|--------|-----------|--------|
| Speed | Fast | Fast |
| Depth | Snippets only | Full content + relevance scores |
| Filtering | None | Domain include/exclude |
| Context | Limited | AI-optimized for LLM consumption |

## Rules

1. **Always try the lightest tool first** — WebSearch before WebFetch before Playwright
2. **Parallel fetch** — When fetching multiple URLs, use parallel tool calls
3. **Close Playwright** — Always close browser after scraping to free resources
4. **Don't guess URLs** — Only use URLs from search results or user input
5. **Report failures** — If all strategies fail, tell user which tools were tried
6. **Rate limit awareness** — Space out requests when scraping multiple pages
