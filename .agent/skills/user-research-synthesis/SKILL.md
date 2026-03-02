---
name: user-research-synthesis
description: Synthesize qualitative and quantitative user research into structured insights. Use when analyzing interview notes, survey responses, support tickets, or behavioral data to identify themes, build personas, or prioritize opportunities.
allowed-tools: Read, Glob, Grep
---

# User Research Synthesis Skill

> Expert at turning raw research data into structured insights that drive product decisions.

## Synthesis Methodology

### Thematic Analysis (Core Method)
1. **Familiarize**: Read all data. Get overall feel before coding.
2. **Code**: Tag each observation/quote with descriptive codes. Be generous — easier to merge than split.
3. **Develop themes**: Group related codes into candidate themes. A theme captures something important about the data.
4. **Review themes**: Check against data. Sufficient evidence? Distinct from each other? Coherent story?
5. **Refine**: Define and name each theme clearly. 1-2 sentence description.
6. **Report**: Write up themes as findings with supporting evidence.

### Affinity Mapping
1. **Capture**: One observation per note. Don't combine multiple insights.
2. **Cluster**: Group by similarity. Let categories emerge — don't pre-define.
3. **Label**: Give each cluster a descriptive name.
4. **Organize**: Arrange clusters into higher-level groups if patterns emerge.
5. **Identify**: Clusters and relationships reveal key themes.

**Tips:** Move notes between clusters freely. If cluster too large, split it. Outliers are interesting — don't force-fit.

### Triangulation
Strengthen findings by combining multiple data sources:
- **Methodological**: Same question, different methods (interviews + survey + analytics)
- **Source**: Same method, different participants or segments
- **Temporal**: Same observation at different points in time

Finding supported by multiple sources is much stronger. When sources disagree — that's interesting, may reveal segments or contexts.

---

## Interview Note Analysis

### Per Interview, Extract:
- **Observations**: Behaviors (what they do) vs attitudes (what they think/feel). Note context.
- **Quotes**: Specific and vivid. Attribute to type, not name: "Enterprise admin, 200-person team"
- **Behaviors vs stated preferences**: What people DO differs from what they SAY. Behavioral > stated.
- **Intensity signals**: Emotional language, frequency, workarounds, consequences

### Cross-Interview Analysis
- **Patterns**: Which observations appear across multiple participants?
- **Frequency**: How many mentioned each theme?
- **Segments**: Do different user types show different patterns?
- **Contradictions**: Where do participants disagree? Reveals meaningful segments.
- **Surprises**: What challenged prior assumptions?

---

## Survey Data Interpretation

### Quantitative
- **Response rate**: Low rate may introduce bias
- **Distribution**: Look at shape, not just averages. Bimodal ≠ normal.
- **Segmentation**: Break down by user segment. Aggregates mask differences.
- **Significance**: Small samples → cautious conclusions
- **Benchmarks**: Compare to industry or previous surveys

### Open-Ended Responses
- Treat as mini interview notes. Code with themes. Count frequency.
- Pull representative quotes. Look for themes not covered by structured questions.

### Common Mistakes
- Reporting averages without distributions
- Ignoring non-response bias
- Over-interpreting small differences (0.1 NPS change = noise)
- Confusing correlation with causation
- Treating Likert scales as interval data — distance between "Strongly Agree" and "Agree" ≠ distance between "Agree" and "Neutral"
- Small sample overconfidence — with n<30, differences need to be large to be meaningful
- Cherry-picking quotes that confirm hypothesis while ignoring contradicting data

---

## Combining Qual + Quant

### The Feedback Loop
1. **Qual first**: Interviews reveal WHAT and WHY. Generate hypotheses.
2. **Quant validation**: Surveys/analytics reveal HOW MUCH and HOW MANY.
3. **Qual deep-dive**: Return to qual for unexpected quant findings.

### Integration
- Use quant to prioritize qual findings. Theme more important if analytics confirms many affected.
- Use qual to explain quant anomalies. Retention drop is a number; interviews reveal the why.
- Present combined: "47% report difficulty with X (survey), interviews reveal this is because Y"

---

## Persona Development

### Building Evidence-Based Personas
1. **Identify behavioral patterns**: Clusters of similar behaviors, goals, contexts
2. **Define distinguishing variables**: What differentiates clusters? (company size, skill, usage, use case)
3. **Create profiles**: Name, behaviors, goals, pain points, context, representative quotes
4. **Validate with data**: Can you size each segment quantitatively?

### Persona Template
- **Who**: Role, company type/size, experience, how they found product
- **Goals**: Primary jobs to be done, how they measure success
- **Usage**: Frequency, key workflows, tools used alongside
- **Pain points**: Top 3 frustrations, workarounds developed
- **Values**: What matters most, what would cause churn
- **Quotes**: 2-3 verbatim capturing their perspective

**Mistakes:** Demographic-based (behavior predicts better). Too many (3-5 max). Fictional. Never updated. No product implications.

---

## Opportunity Sizing

### Estimate per Finding
- **Addressable users**: How many could benefit? Use analytics/survey/market data.
- **Frequency**: Daily, weekly, monthly, one-time?
- **Severity**: Blocker, significant friction, minor annoyance?
- **Willingness to pay**: Drives upgrades, retention, or acquisition?

### Scoring
- **Impact** = Users × Frequency × Severity
- **Evidence strength**: Multiple sources > single. Behavioral > stated.
- **Strategic alignment**: Fits company strategy and product vision?
- **Feasibility**: Technically feasible? Resources available?

Present with transparency: show assumptions, use ranges not false precision.
