---
name: feature-spec
description: Write structured product requirements documents (PRDs) with problem statements, user stories, requirements categorization, acceptance criteria, and success metrics. Use when speccing a new feature, writing a PRD, defining acceptance criteria, or prioritizing requirements.
allowed-tools: Read, Glob, Grep
---

# Feature Spec Skill

> Expert at writing PRDs and feature specifications. Defines what to build, why, and how to measure success.

## PRD Structure

### 1. Problem Statement
- Describe user problem in 2-3 sentences
- Who experiences it and how often
- Cost of NOT solving it (user pain, business impact, competitive risk)
- Ground in evidence: user research, support data, metrics, customer feedback

### 2. Goals (3-5)
- Specific, measurable outcomes tied to user or business metrics
- Each answers: "How will we know this succeeded?"
- Distinguish user goals (what users get) vs business goals (what company gets)
- Outcomes, not outputs: "reduce time to first value by 50%" not "build onboarding wizard"

### 3. Non-Goals (3-5)
- Things this feature explicitly will NOT do
- Adjacent capabilities out of scope for this version
- For each, briefly explain WHY it's out of scope
- Non-goals prevent scope creep and set expectations

### 4. User Stories
Format: "As a [user type], I want [capability] so that [benefit]"

**Good stories are INVEST:**
- **I**ndependent — can be delivered alone
- **N**egotiable — details can be discussed
- **V**aluable — delivers value to the user
- **E**stimable — team can estimate effort
- **S**mall — completable in one sprint
- **T**estable — clear way to verify

**Common mistakes:**
- Too vague: "As a user, I want it faster" — what specifically?
- Solution-prescriptive: "I want a dropdown" — describe the need
- No benefit: "I want to click a button" — why?
- Too large: "I want to manage my team" — break into specifics

### 5. Requirements Categorization

**MoSCoW Framework:**

| Priority | Definition | Test |
|---|---|---|
| **Must (P0)** | Cannot ship without. Minimum viable. | "Would we NOT ship without this?" |
| **Should (P1)** | Important but not critical for launch | Fast follow-ups after launch |
| **Could (P2)** | Desirable if time permits | Won't delay delivery if cut |
| **Won't** | Explicitly out of scope this version | May revisit in future |

**Rules:**
- Be ruthless about P0s. Tighter must-have list = faster ship and learn
- If everything is P0, nothing is P0. Challenge every must-have
- P2s are architectural insurance — guide design even if not building now

### 6. Acceptance Criteria

**Given/When/Then format:**
- Given [precondition or context]
- When [action the user takes]
- Then [expected outcome]

**Or checklist format:**
- [ ] Happy path works
- [ ] Error cases handled
- [ ] Edge cases covered
- [ ] Negative test cases (what should NOT happen)

**Tips:**
- Cover happy path, errors, and edge cases
- Be specific about behavior, not implementation
- Each criterion independently testable
- Avoid ambiguous: "fast", "user-friendly", "intuitive" — define concretely

### 7. Success Metrics

**Leading indicators** (change in days/weeks):
- Adoption rate: % eligible users who try feature
- Activation rate: % who complete core action
- Task completion rate: % who accomplish goal
- Time to complete: how long the core workflow takes
- Error rate: how often users encounter dead ends

**Lagging indicators** (change in weeks/months):
- Retention impact, revenue impact, NPS change
- Support ticket reduction, competitive win rate

**Setting targets:**
- Specific: "50% adoption within 30 days" not "high adoption"
- Based on comparable features, benchmarks, or explicit hypotheses
- Set "success" threshold and "stretch" target
- Define measurement method: what tool, what query, what time window

### 8. Open Questions
- Tag each with who should answer (engineering, design, legal, data)
- Distinguish blocking (must answer before starting) vs non-blocking

### 9. Timeline Considerations
- Hard deadlines, dependencies, suggested phasing

---

## Scope Management

**Recognizing scope creep:**
- Requirements keep getting added after approval
- "Small" additions accumulate into significantly larger project
- Launch date keeps moving without explicit re-scoping

**Preventing scope creep:**
- Write explicit non-goals
- Any scope addition requires a scope removal or timeline extension
- Separate "v1" from "v2" clearly
- Review spec against original problem statement
- Time-box investigations: "If we can't figure out X in 2 days, cut it"

---

## Best Practices

**Before writing:** Talk to 3+ users. Review support tickets + analytics. Define success concretely.

**During writing:** Start with problem, not solution. Get early engineering (feasibility) and design (usability) feedback. Challenge every P0.

**After writing:** Review with cross-functional stakeholders. Update as you learn — PRD is living doc. Archive final version for post-launch review.

**Red flags:**
- No metrics defined — how will you know if it worked?
- All requirements are P0 — you haven't prioritized
- Solution in search of problem — no clear user pain identified
- Implementation details in PRD — that's for tech spec
