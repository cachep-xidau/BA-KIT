# Impact Analysis

## Purpose

Assess effects of proposed changes on systems, processes, stakeholders, and project timeline before implementation.

## Impact Assessment Framework

### 1. Identify Change Scope

- What is changing? (feature, process, data, integration)
- What triggered change? (bug, enhancement, compliance, tech debt)
- Who requested? (stakeholder, regulatory, internal)

### 2. Dependency Mapping

**Upstream Dependencies**: What feeds into affected component?
**Downstream Dependencies**: What consumes from affected component?
**Lateral Dependencies**: What shares resources/data?

```
[Data Source] → [Affected Module] → [Dependent Systems]
                     ↓
              [Shared Database]
                     ↓
              [Reports/Analytics]
```

### 3. Impact Categories

| Category | Questions | Risk Level |
|----------|-----------|------------|
| Technical | Code changes? DB schema? APIs? | H/M/L |
| Data | Migration needed? Data loss risk? | H/M/L |
| Process | Workflow changes? Training needed? | H/M/L |
| Schedule | Timeline impact? Dependencies blocked? | H/M/L |
| Cost | Dev hours? Infrastructure? Licenses? | H/M/L |
| Users | Who affected? How many? | H/M/L |

### 4. Risk Assessment

**Probability × Impact = Risk Score**

| Risk | Probability | Impact | Score | Mitigation |
|------|-------------|--------|-------|------------|
| Data corruption | Low | High | Medium | Backup before change |
| Performance degradation | Medium | Medium | Medium | Load testing |
| User confusion | High | Low | Medium | Training docs |

## Change Request Template

```
Change ID: CR-###
Title: [Brief description]
Requester: [Name/Role]
Date: [YYYY-MM-DD]
Priority: [Critical/High/Medium/Low]

Description: [Detailed explanation]

Business Justification: [Why needed]

Affected Components:
- [ ] Frontend
- [ ] Backend API
- [ ] Database
- [ ] Integration
- [ ] Documentation

Impact Assessment:
- Technical: [H/M/L] - [Details]
- Data: [H/M/L] - [Details]
- Schedule: [Days/Weeks]
- Cost: [Hours/Budget]

Risks:
1. [Risk + Mitigation]
2. [Risk + Mitigation]

Recommendation: [Approve/Reject/Defer]
```

## Backward Traceability

If code changes, trace back:
1. Which test cases cover this code?
2. Which requirements does this implement?
3. Which stakeholders are affected?
4. Which documentation needs update?

## Quick Assessment Checklist

- [ ] All affected components identified
- [ ] Dependencies mapped (upstream/downstream)
- [ ] Risk assessment completed
- [ ] Stakeholders notified
- [ ] Test plan updated
- [ ] Documentation update planned
- [ ] Rollback plan defined
