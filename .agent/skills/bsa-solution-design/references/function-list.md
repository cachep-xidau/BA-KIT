# Function List

Development-ready function documentation with overview table and Main Flow specifications + optional NFR for sprint planning and developer handoff.

## Template

```markdown
# Function List: [Feature Name]

**Feature:** [Feature description]
**Module:** [MODULE-CODE] - [Module Name]
**Total Functions:** [N]

## Function Overview Table

| Function ID | Function Name | Description | Link | Figma |
|-------------|---------------|-------------|------|----------|
| F-XXX-001 | [Name] | [1-sentence description] | [URL or TBD] | [URL or TBD] |

## Detailed Specifications

### F-XXX-001: [Function Name]

**Main Flow:**
1. [High-level step 1]
2. [High-level step 2]
3. [High-level step 3-5]

**NFR:** *(Optional - include only if applicable)*
- **Performance:** Response time, throughput
- **Security:** Authentication, authorization, encryption
- **Reliability:** Uptime, failover, error recovery
- **Scalability:** Concurrent users, data volume
```

**Guidelines:**
- Main Flow: 3-5 high-level steps, avoid excessive UI detail
- NFR: Include only if applicable (Performance, Security, Reliability, Scalability)

## Complete Example

```markdown
# Function List: Widget Customization

## Function Overview Table

| Function ID | Function Name | Description | Link | Figma |
|-------------|---------------|-------------|------|----------|
| F-TOD-010 | Access Widget Customization | Provide easy access to widget settings via Settings icon | TBD | TBD |
| F-TOD-012 | Toggle Widget Visibility | Allow show/hide widgets with minimum 1 visible validation | TBD | TBD |

## Detailed Specifications

### F-TOD-010: Access Widget Customization

**Main Flow:**
1. User taps Settings icon in top-right corner of Today Overview
2. System displays "Customize Dashboard" screen within 200ms
3. System loads current widget preferences
4. System displays customization interface

**NFR:**
- **Performance:** Response time < 200ms
- **Security:** Requires authentication

### F-TOD-012: Toggle Widget Visibility

**Main Flow:**
1. User taps toggle switch for a specific widget
2. System validates action (ensure not hiding last visible widget)
3. If validation passes: Update state, animate toggle, persist to storage
4. If validation fails: Keep toggle ON, display error toast, haptic feedback
5. System updates widget counter showing "X/6 widgets visible"

**NFR:**
- **Performance:** Toggle response < 50ms
- **Reliability:** Auto-save with 3-retry logic
```

## Writing Guidelines

**Main Flow:**
- 3-5 high-level steps, avoid excessive UI detail
- Focus on user actions and system responses

**Good:** "User taps Settings icon in top-right corner"
**Bad:** "User navigates to settings screen by tapping the gear icon located in the upper right quadrant of the navigation bar"

**NFR (Optional):**
Include only if applicable - Performance, Security, Reliability, Scalability

## What NOT to Include

Function Lists focus on Main Flow + NFR. Exclude:

- **Pre/Post-conditions:** Use User Story sections
- **Alternative/Exception Flows:** Use User Story Exception Handling
- **Business Rules:** Use User Story BR table
- **Detailed Specs:** SQL queries, API calls → SRS document
- **Deploy Time:** Track in Jira/project management
- **Value Statements:** Use Overview Table description column
