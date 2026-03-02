---
name: pricing-research
description: Research and validate pricing strategies using Van Westendorp, Gabor-Granger, conjoint analysis, and competitive benchmarking. Use when setting prices, evaluating pricing models, testing willingness-to-pay, or restructuring pricing tiers.
allowed-tools: Read, Glob, Grep
---

# Pricing Research Skill

> Expert at pricing research — willingness-to-pay estimation, pricing model selection, and competitive price positioning.

## Van Westendorp Price Sensitivity Meter

### The 4 Questions
Ask target customers about your product/service:
1. At what price would you consider it **too expensive** to consider?
2. At what price would you consider it **expensive but worth considering**?
3. At what price would you consider it a **bargain/great buy**?
4. At what price would you consider it **too cheap** (suspect quality)?

### Analysis
Plot cumulative distributions of responses. Key intersections:
- **Point of Marginal Cheapness (PMC)**: "Too cheap" = "Expensive" — lower bound
- **Point of Marginal Expensiveness (PME)**: "Too expensive" = "Bargain" — upper bound
- **Indifference Price Point (IDP)**: "Expensive" = "Bargain" — expected price
- **Optimal Price Point (OPP)**: "Too cheap" = "Too expensive" — least resistance

### Acceptable Price Range
PMC to PME defines the range. Price within this band.

### Requirements
- Minimum 100 respondents for reliable results
- Respondents must understand the product (show description/demo first)
- Segment results by buyer type — willingness varies dramatically

### Strengths & Limitations
- **Strength**: Simple to execute, gives price range not just point estimate
- **Limitation**: Hypothetical — stated ≠ actual behavior. No revenue optimization.

---

## Gabor-Granger Method

### Method
Test purchase intent at specific price points to build a demand curve.

### Steps
1. Show product description
2. Ask: "Would you buy this at $X?" (Yes/No/Maybe)
3. If Yes → increase price, ask again
4. If No → decrease price, ask again
5. Plot % willing to buy at each price point

### Output
- **Demand curve**: Purchase probability at each price
- **Revenue-maximizing price**: Price × conversion = revenue index
- **Price elasticity**: How sensitive is demand to price changes?

### Revenue Optimization Table
```
| Price | % Would Buy | Revenue Index |
|---|---|---|
| $10 | 80% | 800 |
| $15 | 65% | 975 ← revenue max |
| $20 | 45% | 900 |
| $25 | 25% | 625 |
| $30 | 10% | 300 |
```

### When to Use
- You have a defined product and need to find optimal price point
- Better than Van Westendorp for revenue optimization
- Works well for subscription pricing

---

## Conjoint Analysis (Simplified)

### Concept
Test how customers value different product attributes (including price) by asking them to choose between bundles.

### Steps
1. **Identify attributes**: Features, support level, usage limits, price
2. **Define levels**: Each attribute has 2-4 options
3. **Create choice sets**: Combinations of attributes for respondents to compare
4. **Analyze**: Calculate part-worth utilities — relative importance of each attribute

### Example Attributes
```
| Attribute | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| Storage | 10GB | 50GB | Unlimited |
| Users | 5 | 25 | Unlimited |
| Support | Email | Chat + Email | Dedicated CSM |
| Price | $29/mo | $79/mo | $199/mo |
```

### Output
- **Relative importance**: Which attributes drive decisions most?
- **Willingness to pay**: How much more for each feature upgrade?
- **Optimal bundles**: Which combinations maximize value perception?

### Best Practice
- Keep to 4-6 attributes, 2-4 levels each
- Include price as an attribute — reveals true trade-offs
- Need 200+ respondents for reliable results
- Use specialized tools (Conjointly, Sawtooth) for proper analysis

---

## Pricing Model Selection

### Common Models

| Model | Best For | Risk |
|---|---|---|
| **Per-seat** | Collaboration tools, predictable scaling | Seat sharing, discourages adoption |
| **Usage-based** | Infrastructure, API, variable consumption | Revenue unpredictability, billing complexity |
| **Tiered** | Broad market, clear segmentation | Feature gating frustration, tier confusion |
| **Freemium** | Network effects, high volume, low marginal cost | Free tier too generous, low conversion |
| **Flat-rate** | Simple value prop, single use case | Leaves money on table for heavy users |
| **Per-unit** | Transactions, records, projects | Hard to predict costs upfront |
| **Hybrid** | Complex products, multiple value dimensions | Billing complexity, hard to communicate |

### Selection Criteria
1. **Value metric**: What unit correlates with customer value? Price on that.
2. **Buyer expectations**: What do competitors charge? What model do buyers expect?
3. **Expansion revenue**: Does model grow with customer success? (NRR > 100%)
4. **Simplicity**: Can you explain pricing in one sentence?
5. **Fairness perception**: Do customers feel they pay for what they use?

### Value Metric Discovery
Ask: "When you get MORE value from [product], what increases?"
- More users → per-seat
- More data/volume → usage-based
- More features needed → tiered
- More teams/departments → per-workspace

---

## Competitive Price Benchmarking

### Data Collection
1. **Public pricing pages**: Screenshot and log (they change often)
2. **Review sites**: G2, Capterra often mention pricing
3. **Sales intel**: Ask prospects what competitors quoted
4. **Industry reports**: Analyst reports sometimes include pricing data

### Comparison Framework
```
| Dimension | Us | Comp A | Comp B | Comp C |
|---|---|---|---|---|
| Entry price | | | | |
| Mid-tier price | | | | |
| Enterprise price | | | | |
| Pricing model | | | | |
| Free tier? | | | | |
| Value metric | | | | |
| Annual discount | | | | |
```

### Positioning Strategies
- **Premium**: Price above market — requires differentiation proof
- **Parity**: Match market — compete on features/experience
- **Penetration**: Price below — acquire share, raise later (risky)
- **Value**: Different metric/model — avoid direct comparison

---

## Price Testing in Practice

### Methods by Effort

| Method | Effort | Reliability |
|---|---|---|
| Ask in interviews | Low | Low (stated intent) |
| Van Westendorp survey | Low | Medium |
| Gabor-Granger survey | Medium | Medium-High |
| Conjoint analysis | High | High |
| A/B test pricing page | Medium | High (real behavior) |
| Negotiation analysis | Low | High (but biased sample) |

### A/B Testing Pricing
- **Legal/ethical**: Ensure different cohorts get same product at test price
- **Duration**: Run long enough for statistical significance
- **Measure**: Conversion AND retention — cheap price may attract wrong users
- **Segmented**: Test by geography, company size, or channel to avoid backlash

### Common Mistakes
- **Cost-plus pricing**: Adding margin to cost ignores value delivered
- **Competitor-matching**: Assumes their pricing is optimized (it's not)
- **One-time research**: Pricing needs revisiting every 6-12 months
- **Fear of charging more**: Most startups underprice — test higher first
- **Ignoring packaging**: What's included matters as much as the number
- **No segmentation**: Different segments have wildly different WTP
