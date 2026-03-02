# Data Analysis

Analyze data structures, flows, and requirements for database design.

## ERD Notation (Crow's Foot)

```
│──────│  One and only one
│──────<  One to many
>──────<  Many to many
│──○───│  Zero or one (optional)
```

## ERD Example

```
┌─────────────┐       ┌──────────────┐
│  Customer   │───┐   │    Order     │
├─────────────┤   └──<├──────────────┤
│ id (PK)     │       │ id (PK)      │
│ name        │       │ customer_id  │
│ email       │       │ total        │
└─────────────┘       └──────────────┘
                             │1:N
                      ┌──────────────┐
                      │  OrderItem   │
                      ├──────────────┤
                      │ order_id     │
                      │ product_id   │
                      │ quantity     │
                      └──────────────┘
```

## Data Flow Diagram

**Elements:**
- External Entity (□) - source/sink
- Process (○) - transforms data
- Data Store (═) - persists data
- Flow (→) - data movement

```
[Customer] ──order──→ (Process) ──→ [Order DB]
```

## Data Dictionary

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique ID |
| name | VARCHAR(100) | NOT NULL | Full name |
| email | VARCHAR(255) | UNIQUE | Email |
| created_at | TIMESTAMP | DEFAULT NOW | Created |

## Normalization

**1NF**: No repeating groups, atomic values
**2NF**: 1NF + no partial dependencies
**3NF**: 2NF + no transitive dependencies
**Denormalization**: Violate NF for query performance

## Data Quality Dimensions

| Dimension | Definition | Validation |
|-----------|------------|------------|
| Accuracy | Correct values | Cross-checks |
| Completeness | No missing | NOT NULL |
| Consistency | Same everywhere | FK constraints |
| Uniqueness | No duplicates | UNIQUE |

## Migration Checklist
- [ ] Source profiling complete
- [ ] Mapping document approved
- [ ] Transform rules defined
- [ ] Validation scripts ready
- [ ] Rollback plan documented

## Best Practices
- Consistent naming (snake_case)
- Always define PKs and FKs
- Index frequently queried columns
- Add audit columns (created_at, updated_at)
- Document in data dictionary
