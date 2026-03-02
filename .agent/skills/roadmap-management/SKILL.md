---
name: roadmap-management
description: Plan and prioritize product roadmaps using frameworks like RICE, MoSCoW, and ICE. Use when creating a roadmap, reprioritizing features, mapping dependencies, or presenting roadmap tradeoffs to stakeholders.
allowed-tools: Read, Glob, Grep
---

# Roadmap Management Skill

> Expert at product roadmap planning, prioritization, and communication.

## Roadmap Formats

### Now / Next / Later
Simplest and often most effective:
- **Now** (current sprint/month): Committed. High confidence in scope and timeline.
- **Next** (1-3 months): Planned. Good confidence in what, less in when.
- **Later** (3-6+ months): Directional. Strategic bets, flexible scope/timing.

Best for: Most teams. Avoids false precision on dates. Good for external comms.

### Quarterly Themes
2-3 themes per quarter representing strategic investment areas:
- Each theme maps to company/team OKRs
- Under each theme, list specific initiatives
- Explains WHY you're building what you're building

Best for: Strategic alignment. Planning meetings. Executive communication.

### OKR-Aligned
Map items directly to Objectives and Key Results:
- Start with team's OKRs for the period
- Under each KR, list initiatives that move that metric
- Include expected impact per initiative
- Clear accountability between what you build and what you measure

### Timeline / Gantt View
Calendar-based view with items on a timeline:
- Shows start dates, end dates, durations, parallelism, sequencing
- Good for identifying resource conflicts and visualizing dependencies
- Use for execution planning with engineering
- NOT good for external communication (creates false precision expectations)

---

## Prioritization Frameworks

### RICE Score
`RICE = (Reach × Impact × Confidence) / Effort`

| Dimension | Definition | Scale |
|---|---|---|
| **Reach** | Users affected in time period | Concrete numbers (e.g., "500/quarter") |
| **Impact** | Needle movement per person | 3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal |
| **Confidence** | Estimate reliability | 100%=data-backed, 80%=some evidence, 50%=gut feel |
| **Effort** | Person-months of work | Include eng, design, all functions |

Best for: Quantitative, defensible prioritization of large backlogs.

### ICE Score (Simpler)
`ICE = Impact × Confidence × Ease` (each scored 1-10)

Best for: Quick prioritization. Early-stage products. Less data available.

### Value vs Effort Matrix (2×2)

| | Low Effort | High Effort |
|---|---|---|
| **High Value** | Quick wins — do first | Big bets — plan carefully |
| **Low Value** | Fill-ins — spare capacity | Money pits — don't do |

Best for: Visual prioritization in team planning sessions.

---

## Dependency Mapping

### Types of Dependencies
- **Technical**: Feature B requires infrastructure from Feature A
- **Team**: Feature requires work from another team
- **External**: Waiting on vendor, partner, third-party
- **Knowledge**: Need research results before starting
- **Sequential**: Must ship A before starting B

### Managing Dependencies
- List all dependencies explicitly in roadmap
- Assign owner to each dependency
- Set "need by" date for depending items
- Build buffer — dependencies are highest-risk items
- Have contingency: what if the dependency slips?

### Reducing Dependencies
- Build simpler version that avoids the dependency?
- Parallelize using interface contract or mock?
- Sequence differently to move dependency earlier?
- Absorb work into your team to remove cross-team coordination?

---

## Capacity Planning

### Estimating Capacity
- Start with headcount × time period
- Subtract known overhead: meetings, on-call, interviews, holidays, PTO
- Rule of thumb: engineers spend 60-70% of time on planned feature work
- Factor in ramp time for new team members
- Result = realistic person-weeks available for roadmap items

### Healthy Allocation (Rule of Thumb)
- **70%** planned features — roadmap items advancing strategic goals
- **20%** technical health — tech debt, reliability, performance, DX
- **10%** unplanned — buffer for urgent issues, quick wins, requests

Adjust ratios: New product → more features. Mature → more tech debt. Post-incident → more reliability.

### Capacity vs Ambition
- If commitments exceed capacity, cut scope — don't pretend people can do more
- When adding to roadmap, always ask: "What comes off?"
- Better to commit to fewer things and deliver reliably

---

## Communicating Roadmap Changes

### When to Change
- New strategic priority from leadership
- Customer feedback that changes priorities
- Technical discovery changing estimates
- Dependency slip, resource change, competitive move

### How to Communicate
1. **Acknowledge**: Be direct about what's changing and why
2. **Explain reason**: What new information drove this?
3. **Show tradeoff**: What was deprioritized to make room?
4. **Show new plan**: Updated roadmap with changes
5. **Acknowledge impact**: Who's affected and how?

### Avoiding Whiplash
- Don't change for every piece of new information — have a threshold
- Batch updates at natural cadences (monthly, quarterly) unless truly urgent
- Track how often roadmap changes. Frequent changes may signal unclear strategy
