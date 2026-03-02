---
name: experimentation
description: Design and analyze product experiments with hypothesis frameworks, A/B test design, statistical rigor, and results interpretation. Use when planning experiments, designing A/B tests, evaluating test results, or building experimentation culture.
allowed-tools: Read, Glob, Grep
---

# Experimentation Skill

> Expert at product experimentation — hypothesis design, A/B testing, statistical analysis, and building a culture of evidence-based decisions.

## Hypothesis Framework

### Structure: If / Then / Because
Every experiment starts with a clear hypothesis:

```
IF we [change],
THEN [measurable outcome] will [direction + magnitude],
BECAUSE [reasoning based on evidence].
```

### Example
```
IF we simplify the signup form from 6 fields to 3,
THEN signup completion rate will increase by 15-25%,
BECAUSE session recordings show 40% of users abandon at field 4,
and competitor benchmarks show 3-field forms convert 20% better.
```

### Hypothesis Quality Checklist
- [ ] **Specific change**: Exactly what are we changing?
- [ ] **Measurable outcome**: What metric moves? By how much?
- [ ] **Evidence-backed reasoning**: Why do we believe this? (Not "I think")
- [ ] **Falsifiable**: Can the experiment prove us wrong?
- [ ] **Time-bound**: When do we expect to see the effect?

### Bad vs Good Hypotheses

| Bad | Good |
|---|---|
| "Users will like the new design" | "New design will increase task completion by 10%" |
| "This will improve engagement" | "Adding onboarding checklist will increase D7 activation from 35% to 45%" |
| "We should try social login" | "Adding Google SSO will increase signup conversion by 20% because 60% of users have Google accounts" |

---

## Experiment Prioritization

### ICE for Experiments

| Factor | Score (1-10) | Meaning |
|---|---|---|
| **Impact** | How much will this move the target metric? | 10 = transformative, 1 = negligible |
| **Confidence** | How sure are we it will work? | 10 = strong evidence, 1 = pure guess |
| **Ease** | How easy to implement and measure? | 10 = trivial, 1 = major effort |

**ICE Score = Impact × Confidence × Ease**

### Prioritization Tips
- Bias toward high-confidence, high-impact experiments
- Low-effort experiments can run in parallel
- Never run zero-confidence experiments on critical flows
- Balance exploitation (optimizing known) vs exploration (testing new)

---

## A/B Test Design

### Key Decisions

| Decision | Options | Considerations |
|---|---|---|
| **Unit** | User, session, device, account | User-level for most product tests |
| **Allocation** | 50/50, 90/10, multi-variant | 50/50 for fastest results |
| **Duration** | Days to weeks | Full business cycles, minimum sample |
| **Metric** | Primary + guardrails | ONE primary metric for decision |
| **Segments** | Pre-defined or post-hoc | Pre-define to avoid p-hacking |

### Anatomy of a Test
1. **Control (A)**: Current experience — no changes
2. **Variant (B)**: Single change being tested
3. **Primary metric**: The ONE metric that decides winner
4. **Guardrail metrics**: Metrics that must NOT degrade (revenue, errors, load time)
5. **Segment dimensions**: Pre-defined cuts (new vs returning, mobile vs desktop)

### Multi-Variant Tests
- A/B/C tests need more sample size (split 3+ ways)
- Good for testing multiple alternatives simultaneously
- Watch for interaction effects if testing multiple changes
- Always include an unchanged control

---

## Sample Size & Statistical Significance

### Key Concepts

| Concept | Definition | Typical Value |
|---|---|---|
| **Significance level (alpha)** | Probability of false positive (detecting effect that doesn't exist) | 5% (p < 0.05) |
| **Power (1 - beta)** | Probability of detecting a real effect | 80% |
| **MDE** (Minimum Detectable Effect) | Smallest improvement worth detecting | Depends on business impact |
| **Baseline conversion** | Current rate of the metric | Measured from historical data |

### Sample Size Rules of Thumb
- Smaller MDE → need MORE samples
- Lower baseline rate → need MORE samples
- Higher confidence → need MORE samples
- Typical: thousands to tens of thousands per variant

### Duration Planning
```
Required sample = f(baseline_rate, MDE, alpha, power)
Duration = Required sample / daily traffic per variant
```

- Minimum 1-2 full business weeks (weekday/weekend patterns)
- Never stop early because results "look significant"
- Account for novelty effect (new ≠ better, just different)

### When You Don't Have Enough Traffic
- Increase MDE (only detect larger effects)
- Use more sensitive metrics (clicks > purchases)
- Run longer
- Consider qualitative methods instead (usability testing, interviews)

---

## Results Interpretation

### Decision Framework

| Result | Primary Metric | Guardrails | Decision |
|---|---|---|---|
| Variant wins | Significant improvement | No degradation | **Ship it** |
| Variant wins | Significant improvement | Some degradation | **Investigate trade-off** |
| No difference | Not significant | No degradation | **Don't ship** (or test longer) |
| Variant loses | Significant degradation | N/A | **Kill it, learn why** |
| Inconclusive | Mixed signals | Mixed signals | **Redesign experiment** |

### What to Report
1. **Hypothesis**: What we tested and why
2. **Setup**: Duration, sample size, allocation
3. **Results**: Primary metric with confidence interval
4. **Guardrails**: Any unexpected movement
5. **Segments**: Did effect vary by segment?
6. **Decision**: Ship, kill, or iterate
7. **Learning**: What did we learn regardless of outcome?

### Confidence Intervals > P-Values
- p-value tells you IF there's an effect
- Confidence interval tells you HOW BIG the effect is (range)
- Report: "Conversion increased 12% (95% CI: 8% to 16%)" — not just "p < 0.05"

---

## Common Pitfalls

### Statistical Pitfalls
- **Peeking**: Checking results daily and stopping when significant → inflated false positive rate. Pre-commit to duration.
- **Multiple comparisons**: Testing 10 metrics → one will be "significant" by chance. Correct with Bonferroni or designate ONE primary metric.
- **Novelty effect**: Users react to change, not improvement. Wait for effect to stabilize (usually 1-2 weeks).
- **Simpson's paradox**: Overall result opposite of every segment. Always segment.
- **Survivorship bias**: Only measuring users who stayed — ignoring those who left.

### Design Pitfalls
- **Testing too many things**: Change one variable at a time. Multiple changes = can't attribute cause.
- **Wrong metric**: Optimizing clicks when you should optimize retention.
- **Selection bias**: Non-random assignment (e.g., power users get variant).
- **Contamination**: Users seeing both variants (shared devices, accounts).

### Cultural Pitfalls
- **HiPPO** (Highest Paid Person's Opinion): Run the test, don't debate.
- **Confirmation bias**: Designing experiments to confirm existing beliefs.
- **Ship everything**: Treating every test as a launch — kill losers fast.
- **Ignoring negative results**: Failed experiments are data. Document learnings.

---

## Experiment Velocity

### Building a Testing Pipeline
1. **Idea backlog**: Collect experiment ideas from all sources (data, research, support, team)
2. **Prioritize**: ICE score weekly. Top 3-5 enter pipeline.
3. **Design**: Write hypothesis + test plan before building
4. **Build**: Minimum viable test — don't over-engineer
5. **Run**: Pre-committed duration, no peeking
6. **Analyze**: Within 2 days of test completion
7. **Act**: Ship winner, document learning, archive

### Capacity Planning
- Parallel experiments on independent surfaces (homepage + checkout + email)
- Serial experiments on same surface (don't run 2 homepage tests simultaneously)
- Budget 20-30% of engineering for experiments
- Track: experiments run/month, win rate, cumulative impact

### Maturity Levels

| Level | Description | Indicators |
|---|---|---|
| **Ad hoc** | Occasional tests, no process | Few tests/quarter, no documentation |
| **Emerging** | Regular testing, basic tools | Monthly tests, hypothesis docs |
| **Established** | Pipeline, culture, tooling | Weekly tests, team-wide participation |
| **Advanced** | ML-driven, multi-armed bandits, personalization | Continuous optimization, automated decisions |
