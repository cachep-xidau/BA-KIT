# Data Architecture

## Database Selection

| Type | Use Case | Examples |
|------|----------|----------|
| Relational (SQL) | Structured data, ACID | PostgreSQL, MySQL |
| Document | Flexible schema, JSON | MongoDB, CouchDB |
| Key-Value | Cache, sessions | Redis, DynamoDB |
| Graph | Relationships, networks | Neo4j, Neptune |
| Time-Series | Metrics, IoT | InfluxDB, TimescaleDB |
| Vector | AI/ML embeddings | Pinecone, Weaviate |

## Data Modeling Approach

### Conceptual (Business view)
Entities, relationships, no technical details

### Logical (Structure view)
Tables, columns, keys, relationships, no physical details

### Physical (Implementation)
Data types, indexes, partitions, storage

## Schema Design Patterns

### Single Table
All related data in one table (NoSQL)
**Pros**: Fast reads, atomic updates
**Cons**: Complex queries, data duplication

### Normalized
Data split into related tables (3NF)
**Pros**: Data integrity, no duplication
**Cons**: Complex joins, slower reads

### Denormalized
Intentional duplication for performance
**Pros**: Fast reads, simple queries
**Cons**: Data sync issues, storage cost

## Data Flow Diagram

```
[Source] → [Ingestion] → [Processing] → [Storage] → [Consumption]
   ↓           ↓             ↓            ↓            ↓
 Files      ETL/ELT      Transform     DB/Lake      API/Report
```

## Migration Strategy

| Strategy | Description | Risk |
|----------|-------------|------|
| Big Bang | All at once, single cutover | High |
| Phased | Incremental migration | Medium |
| Parallel | Run both, sync data | Low |
| Strangler | Gradually replace | Low |

## Data Governance Checklist

- [ ] Data ownership defined
- [ ] Classification (public/internal/confidential/restricted)
- [ ] Retention policies
- [ ] Backup/recovery procedures
- [ ] Access controls (RBAC)
- [ ] Audit logging
- [ ] Encryption (at rest, in transit)
- [ ] Compliance requirements (GDPR, HIPAA)

## Storage Estimation

```
Records × Record Size × Growth Rate × Retention = Storage Need
Example: 1M × 1KB × 1.2 × 3 years = 3.6 TB
```

## Caching Strategy

| Pattern | Description |
|---------|-------------|
| Cache-Aside | App manages cache |
| Read-Through | Cache loads on miss |
| Write-Through | Writes go to cache first |
| Write-Behind | Async write to DB |
