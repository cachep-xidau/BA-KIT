---
name: bsa-analysis
description: Business analysis techniques for BSA professionals. Use when performing requirements analysis (elicitation, validation, traceability), gap analysis (as-is vs to-be), impact analysis (change assessment, dependencies), process analysis (flowchart, workflow optimization), data analysis (ERD, data flows), stakeholder analysis (RACI, power/interest grid), or creating analysis deliverables (BRD, FRD, SRS). Covers MoSCoW prioritization, root cause analysis, architecture patterns, and prototyping.
allowed-tools: Read, Glob, Grep
---

# BSA Analysis Skill

Structured business analysis techniques for BSA professionals to analyze requirements, processes, data, stakeholders, and change impacts.

## When to Use

Activate for:
- Requirements elicitation, validation, decomposition
- Functional/Non-functional requirements specs
- Architecture pattern selection
- Gap analysis (current vs future state)
- Impact analysis for change requests
- Process mapping and optimization
- Data modeling and flow analysis
- Stakeholder identification and management
- Prioritization (MoSCoW, RICE, weighted scoring)
- Prototyping and validation

## Quick Reference

Load references as needed:

| Analysis Type | Reference | Use Case |
|---------------|-----------|----------|
| Requirements | `references/requirements-analysis.md` | Elicitation techniques, validation checklist, pitfalls |
| Functional Reqs | `references/functional-requirements.md` | User-flow-centric FRD template, numbered headings, edge cases |
| Non-Functional Reqs | `references/non-functional-requirements.md` | Performance, security, scalability, platform metrics |
| Architecture | `references/architecture-design.md` | Patterns, technology selection, ADR, C4 diagrams |
| Prototyping | `references/prototyping.md` | Wireframes, mockups, validation sessions, tools |
| Impact | `references/impact-analysis.md` | Change assessment, dependency mapping, risk |
| Gap | `references/gap-analysis.md` | As-is/to-be, fit-gap, migration planning |
| Process | `references/process-analysis.md` | Flowchart (PlantUML), workflows, bottleneck identification |
| Data | `references/data-analysis.md` | ERD, data flows, schema design |
| Stakeholder | `references/stakeholder-analysis.md` | RACI, power grid, communication planning |

## Core Framework

**Analysis Lifecycle:**
1. **Scope** - Define boundaries, constraints, objectives
2. **Gather** - Elicit info via interviews, workshops, docs
3. **Analyze** - Apply techniques, identify patterns, gaps
4. **Validate** - Confirm with stakeholders, resolve conflicts
5. **Document** - Create deliverables (BRD/FRD/SRS)
6. **Trace** - Link requirements to design, test, code

## Deliverable Templates

**BRD (Business Requirements):** High-level business needs, success criteria, scope
**FRD (Functional Requirements):** User-flow-centric feature catalog, functional requirements with step-by-step interactions, NFRs, validation criteria
**SRS (Software Requirements):** Technical specs, NFRs, interfaces

## Prioritization Methods

- **MoSCoW**: Must/Should/Could/Won't - quick stakeholder consensus
- **RICE**: Reach × Impact × Confidence / Effort - quantitative scoring
- **Weighted Scoring**: Custom criteria with stakeholder weights
- **Kano Model**: Basic/Performance/Delight categorization

## Instructions

1. Identify analysis type needed from user context
2. Load relevant reference file(s) for detailed guidance
3. Apply structured framework from reference
4. Output analysis in clear format with actionable insights
5. Suggest next steps and related analyses

**For complex analyses:** Combine multiple reference files (e.g., requirements + impact for change requests).

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `architecture` | System design decisions, ADRs |
| `database-design` | Database schema, ERD |
| `brainstorming` | Discovery questions, Socratic gate |
| `plan-writing` | Implementation planning |
| `feature-spec` | PRD writing (product-manager agent) — BSA owns BRD/FRD, PM owns PRD |
| `stakeholder-comms` | Status updates, risk comms (product-manager agent) — BSA owns RACI, PM owns status reports |

## Confluence MCP Integration

**Pull existing documentation before elicitation:**
- `confluence_search(query)` → Find existing specs, SOPs, process docs
- `confluence_get_page(pageId)` → Pull full page content for analysis
- `confluence_list_pages(spaceKey)` → Browse project space for relevant docs

**Workflow:** Search Confluence → Extract existing requirements/rules → Identify gaps → Elicit only what's missing
