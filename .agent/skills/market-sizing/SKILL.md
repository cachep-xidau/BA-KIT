---
name: market-sizing
description: Estimate market size using TAM/SAM/SOM frameworks with top-down and bottom-up approaches. Use when sizing a new market, validating addressable opportunity, estimating revenue potential, or preparing investor-facing market analysis.
allowed-tools: Read, Glob, Grep
---

# Market Sizing Skill

> Expert at estimating market size — TAM/SAM/SOM, top-down vs bottom-up, growth modeling, and assumption documentation.

## The Three Layers

| Layer | Definition | Question It Answers |
|---|---|---|
| **TAM** (Total Addressable Market) | Total demand for your category if you had 100% share | How big is the universe? |
| **SAM** (Serviceable Addressable Market) | Portion of TAM you can realistically reach with your product, channel, and geography | What can we actually serve? |
| **SOM** (Serviceable Obtainable Market) | Portion of SAM you can realistically capture in 1-3 years | What will we likely win? |

### Relationships
- TAM >> SAM >> SOM (always)
- SOM = SAM x expected market share (typically 1-5% for new entrants, 10-20% for established players)
- If SAM ≈ TAM, your segmentation is too broad

---

## Top-Down Sizing

### Method
Start with industry-wide data, narrow to your segment.

### Steps
1. **Find total market value**: Industry reports (Gartner, Statista, IBISWorld, Grand View Research)
2. **Apply filters**: Geography, segment, product category, customer type
3. **Calculate**: TAM × relevant % = SAM

### Example
```
Global CRM market: $65B (TAM)
× SMB segment: 35% → $22.75B
× North America: 40% → $9.1B (SAM)
× Realistic share (3%): → $273M (SOM)
```

### Strengths
- Fast, uses existing data
- Good for investor decks and initial validation

### Weaknesses
- Relies on analyst definitions that may not match your product
- Can inflate numbers (garbage in, garbage out)
- Doesn't prove demand exists for YOUR specific solution

---

## Bottom-Up Sizing

### Method
Start with unit economics, scale up to total opportunity.

### Steps
1. **Define target customer**: Specific profile (industry, size, role)
2. **Count customers**: How many exist? (Census, LinkedIn, industry databases)
3. **Estimate value per customer**: Price × purchase frequency
4. **Calculate**: Customers × value per customer = Market size

### Example
```
Target: SaaS companies, 50-500 employees, US
Count: ~12,000 companies (LinkedIn Sales Navigator)
ARPU: $500/month = $6,000/year
SAM: 12,000 × $6,000 = $72M
Penetration (5% year 1): $3.6M (SOM)
```

### Strengths
- Grounded in real, countable units
- Directly tied to your pricing and target
- More credible to sophisticated investors

### Weaknesses
- Harder to find precise customer counts
- Can underestimate if you miss segments
- Assumes current pricing (may evolve)

---

## Which Approach to Use

| Situation | Approach | Why |
|---|---|---|
| Investor pitch (early) | Both, lead with top-down | Shows big opportunity + you've done the work |
| Go/no-go decision | Bottom-up | Need realistic revenue potential |
| New category (no reports) | Bottom-up only | No industry data to start from |
| Budget planning | Bottom-up | Ties to actual sales targets |
| Strategic planning | Both, cross-validate | Discrepancy reveals insight |

**Best practice:** Always do both. If they diverge by >3x, investigate why.

---

## Market Growth Rate

### Estimating Growth
- **Historical CAGR**: Past 3-5 years growth rate from industry reports
- **Adjacent market growth**: If no direct data, use comparable markets
- **Driver analysis**: What forces push growth? (digital adoption, regulation, behavior shift)
- **Inhibitor analysis**: What forces slow growth? (saturation, regulation, substitutes)

### Growth Rate Categories

| Rate | Classification | Typical Context |
|---|---|---|
| <5% | Mature/slow | Established markets, replacement demand |
| 5-15% | Moderate | Growing markets with proven demand |
| 15-30% | High growth | Emerging categories, strong tailwinds |
| >30% | Hypergrowth | New categories, paradigm shifts |

### Projection Tips
- Never project >5 years — too speculative
- Use ranges, not single numbers (optimistic/base/pessimistic)
- Show assumptions explicitly — readers can adjust
- CAGR smooths reality — actual growth is lumpy

---

## Documenting Assumptions

**Every market sizing MUST include an assumptions table:**

```
| Assumption | Value | Source | Confidence |
|---|---|---|---|
| Total SaaS companies US | 25,000 | Gartner 2025 | High |
| % with 50-500 employees | 48% | Census Bureau | High |
| Annual contract value | $6,000 | Competitive pricing | Medium |
| Year 1 penetration rate | 5% | Industry benchmark | Low |
```

### Confidence Levels
- **High**: Published data, census, verified databases
- **Medium**: Industry benchmarks, analyst estimates, proxy data
- **Low**: Team estimates, analogies, educated guesses

> Label every assumption. Reviewers will challenge them — make it easy to update numbers without redoing the whole analysis.

---

## Validation Techniques

1. **Triangulate**: Top-down and bottom-up should be within 2-3x of each other
2. **Sanity check**: Does SOM imply realistic sales velocity? (customers/month, deal size)
3. **Competitor revenue**: If known competitors do $X, does your sizing make sense?
4. **Customer interviews**: Would target customers actually pay your assumed price?
5. **Proxy markets**: Similar products in adjacent markets — what's their penetration?

---

## Common Mistakes

- **TAM = everyone**: "Anyone with a smartphone" is not a market
- **Confusing TAM with revenue**: TAM is theoretical ceiling, not forecast
- **Ignoring substitutes**: Free alternatives, manual processes, doing nothing
- **Static sizing**: Markets change — size at a point in time, note trajectory
- **Single number**: Always present ranges with assumptions
- **Circular logic**: Using your own growth targets to estimate market size
