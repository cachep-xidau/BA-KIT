// Prompt templates for BSA artifact generation

export const TEMPLATES = {
    'user-story': {
        system: `You are an expert Business Systems Analyst. Generate user stories in industry-standard format.
Output as structured markdown with the following format for each story:

## US-{number}: {title}

**As a** {role}
**I want to** {action}
**So that** {benefit}

### Acceptance Criteria
- [ ] AC-1: {criterion}
- [ ] AC-2: {criterion}

### Priority: {High|Medium|Low}
### Story Points: {estimate}`,

        prompt: (prdContent: string) => `Analyze the following PRD and generate comprehensive user stories.
Group stories by epic/feature area. Include acceptance criteria for each story.

PRD Content:
${prdContent}`,
    },

    'function-list': {
        system: `You are an expert BSA generating a Function List (FL). Output a structured markdown table.

Use this format:

| # | Function ID | Function Name | Description | Screen/Module | Input | Output | Business Rules | Priority |
|---|------------|---------------|-------------|---------------|-------|--------|----------------|----------|

Include all functional requirements derived from the PRD. Be thorough and precise.`,

        prompt: (prdContent: string, context?: string) => {
            let prompt = `Analyze the following PRD and extract all functional requirements into a Function List.
Be exhaustive — capture every feature, interaction, and business rule.

PRD Content:
${prdContent}`;
            if (context) {
                prompt += `\n\nAdditional Context (from Figma/Confluence):\n${context}`;
            }
            return prompt;
        },
    },

    'srs': {
        system: `You are an expert BSA writing a Software Requirements Specification (SRS).
Follow IEEE 830 structure. Output structured markdown.

Include these sections:
1. Introduction (Purpose, Scope, Definitions)
2. Overall Description (Product Perspective, Functions, Users, Constraints)
3. Specific Requirements (Functional, Non-Functional, Interface)
4. System Features (detailed feature descriptions)
5. Data Requirements (entities, relationships)
6. External Interface Requirements (UI, API, Hardware)`,

        prompt: (prdContent: string, context?: string) => {
            let prompt = `Generate a comprehensive SRS document from the following PRD.

PRD Content:
${prdContent}`;
            if (context) {
                prompt += `\n\nAdditional Context:\n${context}`;
            }
            return prompt;
        },
    },

    'erd': {
        system: `You are an expert database architect. Generate an Entity-Relationship Diagram specification.
Output using DBML notation (dbdiagram.io compatible).

Format:
\`\`\`dbml
Table table_name {
  id integer [pk, increment]
  field_name type [not null, note: 'description']
  created_at timestamp [default: \`now()\`]
}

Ref: table_a.field > table_b.field
\`\`\`

Include all entities, attributes, relationships, and cardinality.`,

        prompt: (prdContent: string) => `Analyze the following PRD and generate a complete ERD in DBML notation.
Identify all entities, their attributes, data types, constraints, and relationships.

PRD Content:
${prdContent}`,
    },

    'sql': {
        system: `You are an expert database engineer. Generate production-ready SQL DDL scripts.
Output TWO versions:

## MySQL Version
\`\`\`sql
-- MySQL DDL
\`\`\`

## SQL Server Version
\`\`\`sql
-- SQL Server DDL
\`\`\`

Include: tables, columns, primary keys, foreign keys, indexes, constraints, and seed data.`,

        prompt: (prdContent: string, erdContent?: string) => {
            let prompt = `Generate complete SQL DDL scripts from the following requirements.`;
            if (erdContent) {
                prompt += `\n\nERD (DBML):\n${erdContent}`;
            }
            prompt += `\n\nPRD Content:\n${prdContent}`;
            return prompt;
        },
    },

    'flowchart': {
        system: `You are an expert BSA creating process flowcharts using Mermaid syntax.
Output the flowchart inside a Mermaid code block.

Format:
\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E
\`\`\`

Use clear, descriptive labels. Include decision nodes, parallel processes, and error flows.
Separate major flows with subgraphs if needed.`,

        prompt: (prdContent: string) => `Analyze the following PRD and generate comprehensive process flowcharts using Mermaid syntax.
Create flowcharts for all major user flows and business processes identified.

PRD Content:
${prdContent}`,
    },

    'sequence-diagram': {
        system: `You are an expert BSA creating sequence diagrams using PlantUML syntax.
Output the diagram inside a PlantUML code block.

Format:
\`\`\`plantuml
@startuml
actor User
participant "Frontend" as FE
participant "API Server" as API
database "Database" as DB

User -> FE: Action
FE -> API: Request
API -> DB: Query
DB --> API: Result
API --> FE: Response
FE --> User: Display
@enduml
\`\`\`

Include all actors, participants, messages, return values, alt/opt/loop fragments, and notes.`,

        prompt: (prdContent: string) => `Analyze the following PRD and generate detailed sequence diagrams using PlantUML syntax.
Create diagrams for all major interactions between actors, systems, and components.

PRD Content:
${prdContent}`,
    },

    'use-case-diagram': {
        system: `You are an expert BSA creating use case diagrams using PlantUML syntax.
Output the diagram inside a PlantUML code block.

Format:
\`\`\`plantuml
@startuml
left to right direction

actor "End User" as user
actor "Admin" as admin

rectangle "System" {
    usecase "Login" as UC1
    usecase "Register" as UC2
    usecase "Manage Users" as UC3
}

user --> UC1
user --> UC2
admin --> UC3
UC3 ..> UC1 : <<include>>
@enduml
\`\`\`

Include all actors, use cases, relationships (include, extend, generalize), and system boundaries.`,

        prompt: (prdContent: string) => `Analyze the following PRD and generate a comprehensive use case diagram using PlantUML syntax.
Identify all actors, use cases, and their relationships (include, extend, generalization).

PRD Content:
${prdContent}`,
    },

    'activity-diagram': {
        system: `You are an expert BSA creating activity diagrams using Mermaid syntax.
Output the diagram inside a Mermaid code block.

Format:
\`\`\`mermaid
flowchart TD
    start((Start)) --> A[Activity 1]
    A --> decision{Condition?}
    decision -->|Yes| B[Activity 2]
    decision -->|No| C[Activity 3]
    B --> fork[/Fork/]
    fork --> D[Parallel Task 1]
    fork --> E[Parallel Task 2]
    D --> join[/Join/]
    E --> join
    join --> finish((End))
    C --> finish
\`\`\`

Model the workflow with activities, decisions, forks/joins for parallel processing, swim lanes (subgraphs) for different actors.`,

        prompt: (prdContent: string) => `Analyze the following PRD and generate detailed activity diagrams using Mermaid syntax.
Model all business workflows with activities, decisions, parallel processes, and actor swim lanes.

PRD Content:
${prdContent}`,
    },

    'screen-description': {
        system: `You are an expert Business Systems Analyst creating Screen Descriptions.
Output structured markdown using the 3-section format: Overview, Fields, Action Buttons.

Format:
# [Screen Name]

**Figma:** [Design link if provided]

## Overview
[1-2 sentence description of screen purpose and user context]

## Fields

| Field Name | Data Type | Description & Rules |
|------------|-----------|---------------------|
| [name] | [type] | [description, validation rules, constraints] |

## Action Buttons

| Button Name | Type | Description & Rules |
|-------------|------|---------------------|
| [name] | [Primary/Secondary/Link/Tab] | [action, navigation, disabled conditions] |

Guidelines:
- Data types: Text, Number, Password, Select, Toggle, Display, List, Date, Image
- Button types: Primary (main CTA), Secondary, Link (navigation), Tab (tab switching)
- Include all interactive elements, display fields, and navigation actions
- Capture validation rules, disabled conditions, and error states`,

        prompt: (prdContent: string, context?: string) => {
            let prompt = `Analyze the following requirements and generate comprehensive Screen Descriptions.
Create a screen description for each screen/view identified. Use the 3-section format (Overview, Fields, Action Buttons).

Requirements:
${prdContent}`;
            if (context) {
                prompt += `\n\nAdditional Context (from Figma/Confluence):\n${context}`;
            }
            return prompt;
        },
    },
} as const;
