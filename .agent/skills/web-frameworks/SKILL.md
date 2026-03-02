---
name: web-frameworks
description: Build with Next.js (App Router, RSC, SSR, ISR), Turborepo monorepos. Use for React apps, server rendering, build optimization, caching strategies, shared dependencies.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Web Frameworks

> Build modern full-stack apps with Next.js, Turborepo, and RemixIcon.

## Selective Reading Rule

**Read ONLY files relevant to the request!** Check content map below.

---

## Content Map

| File | Description | When to Read |
|------|-------------|--------------|
| `references/nextjs-app-router.md` | Routing, layouts, pages, parallel routes | Setting up routes |
| `references/nextjs-server-components.md` | RSC patterns, client vs server | Component decisions |
| `references/nextjs-data-fetching.md` | fetch API, caching, revalidation | Data fetching |
| `references/nextjs-optimization.md` | Images, fonts, bundle analysis | Performance |
| `references/turborepo-setup.md` | Installation, workspace config | Monorepo setup |
| `references/turborepo-pipelines.md` | Dependencies, parallel execution | Build pipeline |
| `references/turborepo-caching.md` | Local/remote cache | CI optimization |
| `references/remix-icon-integration.md` | Installation, usage, accessibility | Icons |

---

## Stack Selection

### Single App: Next.js + RemixIcon
- E-commerce, SaaS, marketing sites, blogs

```bash
npx create-next-app@latest my-app
npm install remixicon
```

### Monorepo: Next.js + Turborepo + RemixIcon
- Microfrontends, multi-tenant, shared component library

```bash
npx create-turbo@latest my-monorepo
```

---

## Quick Reference

### Next.js Patterns
```tsx
// Server Component (default)
async function Page() {
  const data = await fetch(url, { next: { revalidate: 60 } })
  return <div>{data}</div>
}

// Client Component
'use client'
function Button() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### Turborepo Pipeline
```json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "test": { "dependsOn": ["build"] }
  }
}
```

### RemixIcon Usage
```tsx
// Webfont
<i className="ri-home-line"></i>

// React
import { RiHomeLine } from "@remixicon/react"
<RiHomeLine size={24} />
```

---

## Python Utilities

| Script | Purpose |
|--------|---------|
| `scripts/nextjs_init.py` | Initialize Next.js with best practices |
| `scripts/turborepo_migrate.py` | Convert monorepo to Turborepo |

```bash
python scripts/nextjs_init.py --name my-app --typescript --app-router
python scripts/turborepo_migrate.py --path ./monorepo --dry-run
```

---

## Best Practices

**Next.js:**
- Server Components by default
- Use loading.tsx and error.tsx
- Leverage caching strategies

**Turborepo:**
- Structure: apps/, packages/
- Define task dependencies (^build)
- Enable remote caching

**RemixIcon:**
- Line style for minimal, fill for emphasis
- Provide aria-labels for accessibility

---

## Resources

- Next.js: https://nextjs.org/docs/llms.txt
- Turborepo: https://turbo.build/repo/docs
- RemixIcon: https://remixicon.com
