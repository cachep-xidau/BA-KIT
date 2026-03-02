# Architecture Design

## Architecture Patterns

### Monolithic
Single deployable unit, simpler ops, harder to scale independently
**Use when**: Small team, simple domain, rapid prototyping

### Microservices
Independent services, scalable, complex ops
**Use when**: Large team, complex domain, independent scaling needed

### Layered (N-Tier)
```
Presentation → Business Logic → Data Access → Database
```
**Use when**: Traditional enterprise apps, clear separation needed

### Event-Driven
Components communicate via events/messages
**Use when**: Loose coupling, async processing, real-time updates

### Serverless
Functions-as-a-Service, auto-scaling, pay-per-use
**Use when**: Variable load, event-triggered, cost optimization

## Component Design

```
┌─────────────────────────────────────────┐
│              Presentation               │
│  (Web UI, Mobile App, API Gateway)      │
├─────────────────────────────────────────┤
│           Application Layer             │
│  (Controllers, Services, Use Cases)     │
├─────────────────────────────────────────┤
│             Domain Layer                │
│  (Entities, Business Logic, Rules)      │
├─────────────────────────────────────────┤
│          Infrastructure Layer           │
│  (Repositories, External APIs, DB)      │
└─────────────────────────────────────────┘
```

## System Context Diagram (C4)

```
┌─────────┐      ┌─────────────┐      ┌─────────┐
│  User   │ ───→ │   System    │ ───→ │External │
│         │ ←─── │             │ ←─── │ System  │
└─────────┘      └─────────────┘      └─────────┘
```

## Technology Selection Criteria

| Criteria | Questions |
|----------|-----------|
| Fit | Does it solve the problem? |
| Maturity | Production-ready? Community? |
| Team Skills | Learning curve? Existing expertise? |
| Cost | License, infrastructure, maintenance? |
| Scalability | Handles growth? |
| Security | Compliant? Vulnerabilities? |

## Architecture Decision Record (ADR)

```
# ADR-001: [Title]
Status: [Proposed|Accepted|Deprecated|Superseded]
Context: [Problem/situation]
Decision: [What we decided]
Consequences: [Results, trade-offs]
```

## Common Patterns

| Pattern | Purpose |
|---------|---------|
| Repository | Abstract data access |
| Factory | Object creation |
| Strategy | Swappable algorithms |
| Observer | Event notification |
| Facade | Simplified interface |
| Adapter | Interface compatibility |
