---
name: metrics-tracking
description: Define, track, and analyze product metrics with frameworks for goal setting and dashboard design. Use when setting up OKRs, reviewing metrics, building dashboards, choosing metrics for a product area, or running metrics reviews.
allowed-tools: Read, Glob, Grep
---

# Metrics Tracking Skill

> Expert at product metrics — defining, tracking, analyzing, and acting on them.

## Product Metrics Hierarchy

### North Star Metric
Single metric capturing core value delivered to users:
- **Value-aligned**: Moves when users get more value
- **Leading**: Predicts long-term business success
- **Actionable**: Product team can influence it
- **Understandable**: Everyone knows what it means

**Examples:** Collaboration → weekly active teams (3+ contributing). Marketplace → weekly transactions. SaaS → weekly users completing core workflow. Developer tool → weekly deployments.

### L1 Metrics (Health Indicators, 5-7 total)

| Stage | Metrics | What It Tells You |
|---|---|---|
| **Acquisition** | New signups, signup conversion, channel mix, CAC | Are new users finding us? |
| **Activation** | Activation rate, time to activate, setup completion | Are new users reaching value? |
| **Engagement** | DAU/WAU/MAU, stickiness (DAU/MAU), core action frequency, feature adoption | Are active users getting value? |
| **Retention** | D1/D7/D30 retention, cohort curves, churn rate | Are users coming back? |
| **Monetization** | Free→paid conversion, MRR/ARR, ARPU, expansion revenue, NRR | Is value translating to revenue? |
| **Satisfaction** | NPS, CSAT, support volume, app store ratings | How do users feel? |

### L2 Metrics (Diagnostic)
Detailed metrics for investigating L1 changes: funnel steps, feature-level usage, segment breakdowns, performance metrics.

---

## Key Metrics Deep-Dive

### DAU / WAU / MAU
- Define "active" carefully — login? Page view? Core action?
- DAU for daily-use products, WAU for weekly, MAU for less frequent
- DAU/MAU ratio (stickiness): >0.5 = daily habit, <0.2 = infrequent
- Trend matters more than absolute number. Segment by user type.

### Retention
- **D1**: Was first experience good enough to return?
- **D7**: Did user establish a habit?
- **D30**: Retained long-term?
- Plot cohort curves. Compare newer vs older cohorts. Segment by activation behavior.

### Activation
- Look at retained vs churned users — what actions differentiate them?
- Should be strongly predictive of long-term retention
- Achievable within first session or few days
- Track rate for every signup cohort. Measure time to activate.

### Conversion
- Map full funnel, measure each step
- Biggest drop-off = highest-leverage opportunity
- Segment by source, plan, user type — they convert very differently
- Track over time as you iterate

---

## Goal Setting: OKRs

### Structure
- **Objectives**: Qualitative, aspirational, time-bound, memorable. 2-3 per period.
- **Key Results**: Quantitative, specific, outcome-based. 2-4 per Objective.

### Example
```
Objective: Make product indispensable for daily workflows
KR1: DAU/MAU ratio from 0.35 → 0.50
KR2: D30 retention for new users from 40% → 55%
KR3: 3 core workflows with >80% task completion rate
```

### Best Practices
- 70% completion = target for stretch OKRs
- KRs measure outcomes (behavior, results), not outputs (features shipped)
- If confident you'll hit all — not ambitious enough
- Review at mid-period. Grade honestly at end.

### OKR Grading Scale

| Score | Rating | Meaning |
|---|---|---|
| 0.0 – 0.3 | **Missed** | Insufficient progress. Investigate why. |
| 0.4 – 0.6 | **Progress** | Meaningful progress but fell short. Learn and adjust. |
| 0.7 – 1.0 | **Achieved** | Hit or exceeded target. Celebrate and raise the bar. |

> If all OKRs score 1.0, they weren't ambitious enough. If all score <0.3, they were unrealistic or under-resourced.

### Setting Targets
- **Baseline**: Current value (must be reliable)
- **Benchmark**: Comparable products, industry data
- **Trajectory**: Current trend (if already +5%/month, 6% target isn't ambitious)
- **Effort**: Investment level justifies ambition level
- Set "commit" (high confidence) and "stretch" (ambitious)

---

## Review Cadences

| Cadence | Duration | Focus | Action |
|---|---|---|---|
| **Weekly** | 15-30 min | North Star, key L1 changes, experiments, anomalies | Investigate if something looks off |
| **Monthly** | 30-60 min | Full L1 scorecard, OKR progress, cohort analysis, feature adoption | Identify 1-3 areas to investigate |
| **Quarterly** | 60-90 min | OKR scoring, trend analysis, YoY, competitive context, retro | Set next quarter OKRs, adjust strategy |

---

## Dashboard Design

### Principles
1. **Start with the question**, not the data. What decisions does this support?
2. **Hierarchy**: North Star top → L1 metrics → L2 on drill-down
3. **Context over numbers**: Current value + comparison + trend direction
4. **Fewer metrics, more insight**: 5-10 that matter. Everything else in detailed report.
5. **Visual status**: Green (on track), Yellow (needs attention), Red (off track)
6. **Actionable**: Every metric should be something team can influence

### Layout
1. **Top**: North Star with trend line and target
2. **Second**: L1 metrics scorecard — value, change, target, status
3. **Third**: Key funnels showing drop-off at each stage
4. **Fourth**: Active experiments and recent launches with early metrics
5. **Drill-down**: L2, segments, detailed time series

### Anti-Patterns
- Vanity metrics (total signups ever — always goes up, means nothing)
- Too many metrics (if it scrolls, cut)
- No comparison (raw numbers without context)
- Output dashboards (tickets closed ≠ product health)
- One dashboard for all audiences (exec ≠ PM ≠ engineer)

### Alerting
- Every alert must be actionable. If you can't act, don't alert.
- Define owner for each alert. Review and tune regularly.
- Threshold, trend, and anomaly alerts. Appropriate severity levels.
