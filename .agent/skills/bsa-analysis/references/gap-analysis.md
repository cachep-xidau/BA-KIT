# Gap Analysis

Compare current state (As-Is) with desired future state (To-Be) to identify gaps.

## Framework

### 1. Define Scope
- Business area/process being analyzed
- Objectives, success criteria, constraints

### 2. Document As-Is State
**Process**: Current workflows, steps, handoffs
**Technology**: Systems, tools, integrations
**People**: Roles, skills, capacity
**Data**: Sources, quality, governance

### 3. Define To-Be State
**Vision**: Ideal future outcome
**Requirements**: Functional + non-functional needs
**Metrics**: Target KPIs, success measures

### 4. Identify Gaps

| Area | As-Is | To-Be | Gap | Priority |
|------|-------|-------|-----|----------|
| Process | Manual approval | Automated workflow | Automation | High |
| Tech | Legacy Excel | Modern SaaS | Migration | High |
| Data | Siloed DBs | Unified lake | Integration | Medium |

### 5. Gap Remediation
- **Action**: What needs to happen
- **Owner**: Who is responsible
- **Timeline**: When to complete
- **Dependencies**: What must happen first

## Fit-Gap Analysis (Software Selection)

| Requirement | Vendor A | Vendor B | Notes |
|-------------|----------|----------|-------|
| REQ-001 | Fit | Gap | B needs customization |
| REQ-002 | Fit | Fit | Both support |

**Fit**: Out-of-box | **Gap**: Customization needed | **Partial**: Some exists

## Migration Planning

```
Phase 1: Foundation (Data cleanup, Infra, Training)
Phase 2: Migration (Parallel run, Data move, Testing)
Phase 3: Cutover (Go-live, Decommission, Handover)
```

## Gap Template

```
Gap ID: GAP-###
Category: [Process/Tech/Data/People]
Priority: [Critical/High/Medium/Low]
Current State: [As-is description]
Desired State: [To-be description]
Gap: [What's missing]
Remediation: [Action + Cost + Timeline]
```

## Gap Categories
- **Capability**: Missing features
- **Performance**: Speed, scale issues
- **Process**: Manual inefficiencies
- **Integration**: Disconnected systems
- **Data**: Quality, accessibility
- **Skill**: Training needs
