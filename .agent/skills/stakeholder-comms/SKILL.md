---
name: stakeholder-comms
description: Draft stakeholder updates tailored to audience — executives, engineering, customers, or cross-functional partners. Use when writing status updates, risk communications, decision documentation (ADRs), or meeting facilitation guides.
allowed-tools: Read, Glob, Grep
---

# Stakeholder Communications Skill

> Expert at product communications — status updates, stakeholder management, risk communication, and decision documentation.

## Update Templates by Audience

### Executive / Leadership
Executives want: strategic context, progress against goals, risks needing help, decisions needing input.

**Format:** Status [G/Y/R] → TL;DR (1 sentence) → Progress (outcomes tied to goals) → Risks (with mitigation + ask) → Decisions needed (options + recommendation + deadline) → Next milestones

**Tips:**
- Lead with conclusion, not journey. "Shipped X, moved Y metric" not "had 14 standups"
- Under 200 words. If they want more, they'll ask
- Status color = YOUR genuine assessment. Yellow is good risk management, not failure
- Only include risks you want help with
- Asks must be specific: "Decision on X by Friday" not "support needed"

### Engineering Team
Engineers want: clear priorities, technical context, blockers resolved, decisions affecting their work.

**Format:** Shipped (with PR/ticket links) → In Progress (owner, ETA, blockers) → Decisions (rationale + ADR link) → Priority changes (what and WHY) → Coming up (with context)

**Tips:**
- Link to specific tickets, PRs, documents
- When priorities change, explain why
- Be explicit about blockers and what you're doing to unblock
- Don't waste time with info that doesn't affect their work

### Cross-Functional Partners
Partners want: what's coming that affects them, what to prepare, how to give input.

**Format:** What's coming (date + impact on their team) → What we need (specific ask + deadline) → Decisions made (how it affects them) → Open for input (topic + how to provide)

### Customer / External
Customers want: what's new, what's coming, how it benefits them.

**Format:** What's new (benefit in customer terms + link) → Coming soon (timing + why it matters) → Known issues (status + workaround) → Feedback channel

**Tips:**
- No internal jargon. No ticket numbers. No technical details.
- Frame as what customer can now DO, not what you built
- Be honest about timelines but don't overcommit

---

## Status Reporting (G/Y/R)

| Status | Meaning | When to Use |
|---|---|---|
| **Green** | On track. No significant risks. | Things genuinely going well |
| **Yellow** | At risk. Mitigation underway, outcome uncertain. | FIRST sign of risk — flag early |
| **Red** | Off track. Need significant intervention. | Exhausted own options, need escalation |

**Rules:**
- Move to Yellow at FIRST sign of risk, not when sure things are bad
- Move to Red when you've exhausted your options and need help
- Move back to Green only when risk is genuinely resolved
- Document what changed when you change status

---

## Risk Communication (ROAM)

| Status | Meaning |
|---|---|
| **Resolved** | No longer a concern. Document how. |
| **Owned** | Acknowledged, someone actively managing. State owner + plan. |
| **Accepted** | Known, proceeding without mitigation. Document rationale. |
| **Mitigated** | Actions reduced risk to acceptable level. Document what was done. |

### Communicating Risks
1. **State clearly**: "Risk that [thing] happens because [reason]"
2. **Quantify impact**: "If this happens, consequence is [impact]"
3. **State likelihood**: "[likely/possible/unlikely] because [evidence]"
4. **Present mitigation**: "Managing this by [actions]"
5. **Make the ask**: "Need [specific help] to reduce this risk"

**Mistakes:** Burying risks in good news. Being vague. Risks without mitigations. Waiting too long.

---

## Decision Documentation (ADR)

### When to Write
- Strategic product decisions (market segment, platform support)
- Significant technical decisions (architecture, vendor, build vs buy)
- Controversial decisions where people disagreed
- Decisions that constrain future options

### Format
```
# [Decision Title]
Status: [Proposed / Accepted / Deprecated / Superseded]
Context: What situation requires a decision? What forces?
Decision: What did we decide? State clearly.
Consequences: Positive, negative, what this enables/prevents.
Alternatives: What was evaluated? Why rejected?
```

**Tips:**
- Write close to when decision is made, not weeks later
- Include who was involved and who made final call
- Document context generously — future readers won't have today's context
- Keep short. One page better than five.

---

## Meeting Facilitation (Quick Reference)

| Meeting | Purpose | Key Rule |
|---|---|---|
| **Standup** | Surface blockers | 15 min max. Focus on blockers. |
| **Sprint Planning** | Commit to work | Come with proposed priority order. Push back on overcommitment. |
| **Retrospective** | Reflect & improve | Psychological safety. 1-3 action items max. Follow up on previous. |
| **Stakeholder Demo** | Show progress, gather feedback | Real product, not slides. Frame feedback questions specifically. |
