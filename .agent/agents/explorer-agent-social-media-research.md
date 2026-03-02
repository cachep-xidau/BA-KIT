# Social Media & Web Research Protocol

**TRIGGER:** When user requests research from social media platforms or web scraping:
- Instagram, LinkedIn, TikTok, YouTube, Facebook analysis
- Google Maps business/lead research
- Amazon product/competitor research
- General web scraping for data gathering

## Step 1: Identify Research Type

**Social Media Keywords:**
- "research Instagram", "analyze TikTok", "LinkedIn data", "YouTube trends"
- "social media monitoring", "competitor analysis on [platform]"
- "scrape posts", "extract comments", "hashtag analysis"

**Business Intelligence Keywords:**
- "Google Maps leads", "local business data", "restaurant reviews"
- "contact extraction", "email scraping from Maps"

**E-commerce Keywords:**
- "Amazon price tracking", "product reviews", "competitor pricing"

## Step 2: Load Apify Skill

When ANY of the above keywords are detected, **IMMEDIATELY load** `@[skills/apify]`:

```typescript
// This triggers the Apify skill which provides:
// - Token-efficient data scraping (99% savings)
// - Pre-built actors for 9+ platforms
// - Code-first filtering (filter BEFORE returning to context)
```

## Step 3: Apify Research Protocol

**For Social Media Research:**
1. Ask user to clarify:
   - Target platform (Instagram/TikTok/LinkedIn/YouTube/Facebook)
   - Research goal (engagement tracking, competitor analysis, trend discovery)
   - Filter criteria (date range, engagement threshold, content type)
   - Max results needed

2. Execute via Apify skill (skill handles implementation)

3. Return filtered, analyzed results to user

**For Business Intelligence:**
1. Clarify search parameters (location, business type, rating threshold)
2. Confirm if contact extraction is needed (email/phone)
3. Execute via Apify skill
4. Return qualified leads with contact info

**For E-commerce:**
1. Identify target products/competitors
2. Confirm data points needed (price, reviews, ratings, availability)
3. Execute via Apify skill
4. Return competitive intelligence

## Step 4: Report Format

After Apify skill completes:
- Summarize total results vs. filtered results (show token savings)
- Highlight key findings (top posts, qualified leads, price trends)
- Suggest next steps based on data

**Example Report:**
```
Social Media Research Complete

Platform: Instagram
Target: @competitor_brand
Results: 100 posts scraped → 12 high-engagement posts (>10k likes)
Token Savings: 98.7% (50,000 → 650 tokens)

Key Findings:
- Top post: 45k likes, product launch announcement
- Engagement spike: Weekends (Sat/Sun)
- Most used hashtags: #ai #tech #innovation

Next Steps:
- Analyze top post content strategy
- Schedule posts for weekend timing
- Incorporate trending hashtags
```

📄 **Reference:** `.agent/skills/apify/SKILL.md`

---

## Web Research Fallback

**When NOT using Apify** (general web research, URL fetching, site scraping):

Load the `web-search` skill for multi-strategy fallback:
```
WebSearch → WebFetch → Playwright (403 bypass) → Tavily (deep search)
```

**Use web-search skill when:**
- Fetching URLs that return 403/blocked
- General web research (not social media specific)
- Combining search results from multiple sources
- Extracting content from dynamic/SPA pages

📄 **Reference:** `.agent/skills/web-search/SKILL.md`
