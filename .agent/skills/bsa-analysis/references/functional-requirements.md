# Functional Requirements

Bridge analysis outputs (BRD/FRD/requirements) to solution design with user-flow-centric approach.

## FRD Document Structure

Use numbered heading format (1, 1.1, 1.1.1) throughout the document for clear hierarchy and easy referencing.

### Recommended FRD Template

```
# Functional Requirements Document (FRD)
## [Product Name]

**Document Version:** X.X
**Date:** YYYY-MM-DD
**Status:** Draft/Review/Approved
**Target Persona:** [Name, Demographics, Context]

---

## 1. Open Questions

**Pending Decisions:**
1. [Question] - Decision by: [Date/Milestone] - Owner: [Role]
2. [Question] - Decision by: [Date/Milestone] - Owner: [Role]

**Assumptions:**
- [Assumption requiring validation]
- [Assumption requiring validation]

---

## 2. Feature Overview

### 2.1 Feature Catalog (MoSCoW Priority)

| ID | Feature | Priority | Description | Strategic Value |
|----|---------|----------|-------------|-----------------|
| FR-001 | Feature Name | Must Have | Brief description | Business impact |
| FR-002 | Feature Name | Should Have | Brief description | Business impact |

---

## 3. Functional Requirements

### 3.1 [Feature Category Name]

#### 3.1.1 FR-001: [Feature Name]

**Priority:** Must Have | Should Have | Could Have
**Platform:** Web | Mobile | Cross-Platform
**Dependencies:** [Other requirements this depends on, e.g., FR-002, FR-005]

**Description:**
[What this feature does in 1-2 sentences, focusing on user value]

**User Flow:**
1. User performs [initial action]
2. System responds with [feedback/result]
3. User provides [input/selection]
4. System validates and [processes]
5. User sees [final state/confirmation]

**Edge Cases:**
- If [condition], then System [behavior]
- If [error condition], then System shows "[error message]"
- If [alternative path], then User [can do alternative action]

---

## 4. Non-Functional Requirements

### 4.1 Performance
- NFR-PERF-001: [Specific metric with target, e.g., "Page load <2s on 4G"]
- NFR-PERF-002: [Specific metric with target]

### 4.2 Security
- NFR-SEC-001: [Security requirement with validation method]
- NFR-SEC-002: [Security requirement with validation method]

### 4.3 Usability
- NFR-UX-001: [Usability requirement with success criteria]

### 4.4 Reliability
- NFR-REL-001: [Reliability requirement with metric]

### 4.5 Scalability
- NFR-SCALE-001: [Scalability requirement]

### 4.6 Maintainability
- NFR-MAINT-001: [Maintainability requirement]

---

## 5. Validation Criteria

### 5.1 Phase Gates

**Phase 1 → 2:**
- [ ] [Specific validation checkpoint with measurable target]
- [ ] [Specific validation checkpoint with measurable target]

**Phase 2 → 3:**
- [ ] [Specific validation checkpoint with measurable target]

### 5.2 Success Metrics

**Technical:**
- [Metric 1]: [Target value with measurement method]
- [Metric 2]: [Target value with measurement method]

**User Experience:**
- [Metric 1]: [Target value with measurement method]
- [Metric 2]: [Target value with measurement method]

---

## 6. Risk Management

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk description] | High/Medium/Low | High/Medium/Low | [Mitigation strategy] |

---

## Appendix: Platform Classification Matrix

| Category | Web | Mobile | Cross-Platform |
|----------|-----|--------|----------------|
| UI/Presentation | Responsive, Browser APIs | Native gestures, Touch UI | Shared components |
| Business Logic | Server/Client-side | On-device, Offline-first | API layer |
| Data Access | LocalStorage, IndexedDB | SQLite, Realm, CoreData | Cloud sync |
| Integration | REST, WebSocket, SSE | Push notif, Deep links | Shared APIs |
| Auth | Cookie/JWT, OAuth web | Biometric, Keychain | Token-based |
```

## User Flow Guidelines

### Format Template

**User Flow:**
1. [Actor] performs [action] (e.g., User taps "Create Entry" button)
2. System responds with [feedback] (e.g., System displays diary entry form)
3. [Actor] provides [input] (e.g., User types reflection text)
4. System validates and [processes] (e.g., System auto-saves every 3 seconds)
5. [Actor] sees [result] (e.g., User sees "Saved" indicator)

### Writing Guidelines

**Do:**
- Use numbered lists for sequential steps
- Alternate between user actions and system responses
- Keep steps concise (10-15 words max)
- Focus on observable interactions
- Use active voice
- Specify the actor (User, System, AI, External Service)
- Describe what happens, not how it's implemented

**Don't:**
- Mention technical implementation (APIs, databases, algorithms)
- Include code snippets, pseudo-code, JSON, SQL
- Describe internal system processes invisible to user
- Use technical jargon unless user-facing
- Combine multiple actions in one step

### Example: User Flow

**✅ GOOD (User Interaction):**
```
**User Flow:**
1. User enters email and password, then taps "Log In"
2. System validates credentials
3. User sees loading indicator for 1-2 seconds
4. System displays "Welcome back, [Name]" message
5. User is redirected to Dashboard screen

**Edge Cases:**
- If incorrect password, System shows "Invalid credentials. Try again"
- If account locked, System shows "Account locked. Contact support"
- If no internet, System shows "Cannot connect. Try again later"
```

**❌ BAD (Technical Implementation):**
```
**User Flow:**
1. User submits login form with POST to /api/auth
2. Backend validates with bcrypt hash comparison
3. JWT token generated with user_id, signed HS256
4. Token stored in localStorage, 7-day expiry
5. React context updated, re-render protected routes
```

## Edge Cases Guidelines

Document alternative paths and error conditions without technical implementation:

**Format:**
```
**Edge Cases:**
- If [condition], then System [behavior]
- If [error condition], then System shows "[user-visible error message]"
- If [alternative path], then User [can do alternative action]
```

**Example:**
```
**Edge Cases:**
- If diary entry empty, System shows "Entry cannot be blank"
- If device storage full, System shows "Storage full. Free up space"
- If offline, System queues entry for sync when online
- If passphrase forgotten, User sees "No recovery available. Create new account"
```

## Validation Checklist

When completing an FRD, validate against this checklist:

- [ ] Open questions listed at document start with decision deadlines
- [ ] All features catalogued with MoSCoW priority
- [ ] Each FR has numbered ID (e.g., FR-SEC-001, FR-DIARY-005)
- [ ] Each FR has user flow with numbered steps
- [ ] User flows describe interactions, not implementation
- [ ] Edge cases documented for each FR
- [ ] Platform assignment for each FR (Web/Mobile/Cross-Platform)
- [ ] Dependencies between FRs identified
- [ ] NFRs categorized (Performance, Security, Usability, Reliability, Scalability, Maintainability)
- [ ] Validation criteria defined with measurable targets
- [ ] Risks identified with impact, probability, and mitigation
- [ ] No technical implementation details (code, SQL, JSON, architecture diagrams)
- [ ] Numbered heading format (1, 1.1, 1.1.1) used throughout

## What NOT to Include in FRD

**Remove these sections (belong in other documents):**

- ❌ Module Decomposition (too technical, developer-focused)
- ❌ Acceptance Criteria (belongs in test plans)
- ❌ Business Rules (too granular, embed in user flows or NFRs)
- ❌ UI Layout/Wireframes (belongs in design specs)
- ❌ Technical Architecture (belongs in architecture docs)
- ❌ UI Settings (belongs in design system)
- ❌ Code blocks/JSON/SQL (implementation details)
- ❌ Requirements Traceability Matrix (project management artifact)
- ❌ Next Steps (project management artifact)
- ❌ Implementation Plan (belongs in Technical Design Doc)
- ❌ Document Approval Sign-Off (project management artifact)

**Create separate documents for:**
- Technical Design Document (TDD): Implementation details, architecture, code patterns
- Test Plan: Acceptance criteria, test cases, QA strategy
- Design Specifications: UI layouts, wireframes, design system
- Project Plan: Timeline, milestones, resource allocation

## Function Types (Reference)

- **CRUD**: Create, Read, Update, Delete operations
- **Business Logic**: Calculations, validations, workflows
- **Integration**: External APIs, third-party services
- **Reporting**: Analytics, exports, dashboards
- **Admin**: Configuration, user management, monitoring

## Platform-Specific Considerations

**Web**: Browser compatibility, SEO, PWA, responsive breakpoints
**Mobile**: App store guidelines, permissions, battery/memory, offline-first
**Cross-Platform**: Code sharing %, platform overrides, native bridges

> See `non-functional-requirements.md` for NFR definitions and platform metrics.
