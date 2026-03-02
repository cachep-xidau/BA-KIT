---
name: customer-journey-mapping
description: Map end-to-end customer journeys with touchpoints, pain points, emotions, and opportunities. Use when analyzing user experience across stages, identifying friction, optimizing onboarding, or designing service blueprints.
allowed-tools: Read, Glob, Grep
---

# Customer Journey Mapping Skill

> Expert at mapping customer journeys — stage definition, touchpoint analysis, pain point identification, and gap analysis.

## Journey Stages

### Standard B2B SaaS Journey

| Stage | Customer Goal | Key Question |
|---|---|---|
| **Awareness** | Realize they have a problem | "I need to solve X" |
| **Consideration** | Evaluate solutions | "Which option fits best?" |
| **Decision** | Choose and purchase | "Is this worth the investment?" |
| **Onboarding** | Get set up and running | "How do I start getting value?" |
| **Adoption** | Integrate into workflow | "Is this becoming essential?" |
| **Retention** | Continue and expand | "Should I renew/upgrade?" |
| **Advocacy** | Recommend to others | "Others should use this too" |

### Adapt Stages to Your Product
- B2C may skip Decision (impulse) or compress Consideration
- PLG products merge Decision + Onboarding (self-serve signup)
- Enterprise adds Procurement and Implementation stages
- Marketplaces have dual journeys (buyer + seller)

> Don't force-fit stages. Map the journey your customers actually take, not the one you wish they took.

---

## Building the Journey Map

### Step 1: Define Scope
- **Which persona?** One map per persona (they have different journeys)
- **Which journey?** First purchase? Renewal? Specific workflow?
- **Current state or future state?** Map current first, then design ideal

### Step 2: Research Inputs
- Customer interviews (most valuable)
- Session recordings (Hotjar, FullStory)
- Support tickets and NPS comments
- Analytics funnel data
- Sales call recordings
- Onboarding completion data

### Step 3: Map Each Stage

For every stage, document:

```
| Element | Description |
|---|---|
| **Actions** | What the customer does |
| **Touchpoints** | Where interaction happens (channels, pages, people) |
| **Thoughts** | What they're thinking |
| **Emotions** | How they feel (frustrated, confident, confused, delighted) |
| **Pain points** | Friction, confusion, blockers |
| **Opportunities** | Ways to improve the experience |
```

---

## Touchpoint Analysis

### Touchpoint Categories

| Category | Examples |
|---|---|
| **Digital owned** | Website, app, email, in-product messages |
| **Digital earned** | Reviews, social mentions, forum posts |
| **Digital paid** | Ads, sponsored content, retargeting |
| **Human** | Sales calls, support chat, CSM meetings |
| **Physical** | Events, direct mail, packaging |
| **Third-party** | Analyst reports, comparison sites, word of mouth |

### Per Touchpoint, Assess:
- **Frequency**: How often does this happen?
- **Impact**: How much does it influence the journey?
- **Ownership**: Who in the org is responsible?
- **Quality**: Current performance (1-5 scale)
- **Data**: What do we measure here?

### Identifying Gaps
- **Missing touchpoints**: Stages with no proactive contact
- **Orphan touchpoints**: Nobody owns it, quality drifts
- **Redundant touchpoints**: Multiple overlapping channels confusing customer
- **Broken handoffs**: Information lost between teams (marketing → sales → CS)

---

## Pain Points & Moments of Truth

### Pain Point Severity

| Level | Description | Action |
|---|---|---|
| **Blocker** | Cannot proceed. Abandons journey. | Fix immediately |
| **Major friction** | Can proceed but frustrated. May churn later. | High priority |
| **Minor friction** | Annoying but manageable. Workaround exists. | Improve when possible |
| **Missed delight** | Not painful, but missed opportunity to impress. | Nice to have |

### Moments of Truth
Critical interactions that disproportionately shape perception:
- **First impression**: Landing page, first email, first login
- **Value moment**: First time product delivers its core promise
- **Recovery moment**: How you handle errors, bugs, complaints
- **Expansion moment**: When need outgrows current plan/usage
- **Renewal moment**: Decision to continue or churn

> Invest disproportionately in moments of truth. A great moment of truth can compensate for minor friction elsewhere.

---

## Emotion Mapping

### Emotion Scale
Map customer emotion at each stage:

```
Stage:     Awareness → Consideration → Decision → Onboarding → Adoption → Retention
Emotion:   Frustrated → Hopeful → Anxious → Confused → Confident → Satisfied
           ──────────────────────────────────────────────────────────────────
Score:     -2         +1          -1        -2          +2          +1
```

### Interpreting Emotion Curves
- **Dips**: Where experience fails expectations — investigate
- **Peaks**: Where you exceed expectations — amplify and protect
- **Flat**: Neutral = forgettable = vulnerable to competitors
- **Sustained negative**: Churn risk zone — intervene proactively

### Data Sources for Emotions
- NPS/CSAT at different stages
- Support ticket sentiment
- Interview quotes with emotional language
- App store review sentiment
- Churn survey responses

---

## Gap Analysis (Current vs Ideal)

### Framework

For each stage, compare:

```
| Stage | Current Experience | Ideal Experience | Gap | Priority |
|---|---|---|---|---|
| Onboarding | Manual setup, 3 days | Guided setup, 30 min | Large | P0 |
| Support | Email only, 24h response | Chat + email, 2h response | Medium | P1 |
| Renewal | No proactive outreach | QBR + usage report | Large | P1 |
```

### Prioritizing Gaps
Score each gap on:
1. **Impact on retention**: Does this gap cause churn?
2. **Impact on expansion**: Does this gap limit upsell?
3. **Volume**: How many customers hit this gap?
4. **Feasibility**: Can we fix this with current resources?

### Action Plan per Gap
- **Quick wins**: Low effort, high impact — do now
- **Strategic projects**: High effort, high impact — plan and resource
- **Monitor**: Low impact — track but don't invest yet
- **Ignore**: Low impact, high effort — explicit decision not to fix

---

## Service Blueprint (Extended View)

### Layers (Front to Back)

| Layer | What It Shows |
|---|---|
| **Customer actions** | What customer does (visible) |
| **Frontstage** | What customer sees (UI, emails, human interactions) |
| **Backstage** | Internal actions supporting frontstage (processing, preparation) |
| **Support processes** | Systems, tools, data enabling backstage (CRM, billing, infra) |

### Line of Visibility
Draw a clear line between what customers see and what happens internally. Useful for:
- Identifying internal bottlenecks customers experience as delays
- Finding where manual processes could be automated
- Spotting team handoffs that break the experience

---

## Common Mistakes

- **Too granular**: 30-step journey map nobody reads. Keep to 5-8 stages.
- **No persona**: Generic journey = useless. Map per persona.
- **Inside-out mapping**: Mapping YOUR process, not customer experience
- **No data**: Journey map based on assumptions ≠ insight. Ground in research.
- **One and done**: Journeys evolve. Review quarterly, update with new data.
- **No action**: Beautiful map that sits in a deck. Every gap needs an owner and plan.
